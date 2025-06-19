import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0 z-10">
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-sm text-white hover:btn-success-focus transition-colors duration-200"
        title="Start video call"
      >
        <VideoIcon className="size-5" />
        <span className="hidden sm:inline ml-2">Video Call</span>
      </button>
    </div>
  );
}

export default CallButton;
