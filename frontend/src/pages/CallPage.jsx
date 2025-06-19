import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getVideoToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  const { authUser, isLoading } = useAuthUser();

  const { data: videoTokenData, isLoading: isTokenLoading, error: tokenError } = useQuery({
    queryKey: ["videoToken"],
    queryFn: getVideoToken,
    enabled: !!authUser,
    retry: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      console.log("Video token fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to fetch video token:", error);
    },
  });

  useEffect(() => {
    const initCall = async () => {
      if (!videoTokenData?.token || !authUser || !callId) {
        console.log("Missing required data:", {
          hasToken: !!videoTokenData?.token,
          hasUser: !!authUser,
          hasCallId: !!callId
        });
        return;
      }

      try {
        console.log("Initializing Stream video client...");
        setError(null);

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        console.log("Creating video client with:", { apiKey: STREAM_API_KEY, userId: user.id });

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: videoTokenData.token,
        });

        console.log("Creating call instance with ID:", callId);
        const callInstance = videoClient.call("default", callId);

        console.log("Joining call...");
        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        setError(error.message || "Could not join the call");
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    // Cleanup function
    return () => {
      if (client) {
        console.log("Cleaning up video client...");
        client.disconnectUser();
      }
    };
  }, [videoTokenData, authUser, callId]);

  // Show loading while user data or token is loading
  if (isLoading || isTokenLoading || isConnecting) {
    return <PageLoader />;
  }

  // Show error if token failed to load
  if (tokenError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load authentication token</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show error if call initialization failed
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Initializing call...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
