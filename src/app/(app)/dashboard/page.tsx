"use client";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/user.model";
import { acceptingMessages } from "@/schemas/acceptingMessages";
import { ApiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { data: session, status } = useSession();

  const handleMessageUpdate = (updatedMessage: Message) => {
  setMessages(messages.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg)));
};

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const form = useForm({
    resolver: zodResolver(acceptingMessages),
  });
  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptingMessages");

  const fetchAcceptedMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptingMessages", response.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast("error", {
        description: axiosError.response?.data.message || "Failed to fetch message setting",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        console.log("API response messages:", response.data.messages);
        setMessages(response.data.messages || []);
        if (refresh) {
          toast("Refreshed Messages", {
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast("error", {
          description: axiosError.response?.data.message || "Failed to fetch message setting",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchMessages();
      fetchAcceptedMessages();
    }
  }, [session, status, fetchAcceptedMessages, fetchMessages, setValue]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptingMessages", !acceptMessages);
      toast(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast("error", {
        description: axiosError.response?.data.message || "Failed to fetch message setting",
      });
    }
  };

  const username = (session?.user as User)?.username;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast("Url Copied", {
      description: "Profile Url has been copied to clipboard",
    });
  };

  // Skeleton Loading UI
  if (status === "loading") {
    return (
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        {/* Skeleton for Title */}
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-4 animate-pulse"></div>

        {/* Skeleton for Copy Link Section */}
        <div className="mb-4">
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="flex items-center">
            <div className="h-10 w-full bg-gray-200 rounded p-2 mr-2 animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton for Switch */}
        <div className="mb-4 flex items-center">
          <div className="h-6 w-12 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="h-px bg-gray-200 mb-4"></div>

        {/* Skeleton for Refresh Button */}
        <div className="h-10 w-10 bg-gray-200 rounded mt-4 animate-pulse"></div>

        {/* Skeleton for Messages Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Unauthenticated State
  if (status === "unauthenticated" || !session?.user) {
    return <div>Please Login</div>;
  }

  // Authenticated State
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <div className="mb-4">
        <Switch
          {...register("acceptingMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {acceptMessages ? "On" : "Off"}</span>
      </div>
      <Separator />
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
              onMessageUpdate={handleMessageUpdate}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;