import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreanToken } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreanToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("initializing chat client");

        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName, // Using wrong property name - should be fullName not name
            image: authUser.profilePic, // Using wrong property name - should be profilePic not profilePicture
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("--");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat client:", error);
        toast.error("Failed to initialize chat. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Call initChat here
    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = async () => {
    if (!channel || !authUser) {
      toast.error("Unable to start call. Please try again.");
      return;
    }

    try {
      // Create a unique call ID using the channel ID
      const callId = channel.id;

      // Send a message to the chat about the video call
      await channel.sendMessage({
        text: `🎥 ${authUser.fullName} started a video call`,
        attachments: [{
          type: 'video_call',
          title: 'Join Video Call',
          title_link: `${window.location.origin}/call/${callId}`,
          text: 'Click to join the video call',
        }]
      });

      // Navigate to the call page immediately
      navigate(`/call/${callId}`);

      toast.success("Starting video call...");
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Failed to start video call. Please try again.");
    }
  };

  if (loading || !chatClient || !channel) {
    return <ChatLoader />;
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus={true} />
            </Window>
          </div>

          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
