'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2, LucideTrash } from 'lucide-react';
import { Message } from '@/model/user.model';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/apiResponse';
import { toast } from 'sonner';
import React, { useState } from 'react';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
  onMessageUpdate: (updatedMessage: Message) => void;
};

const MessageCard = ({ message, onMessageDelete, onMessageUpdate }: MessageCardProps) => {
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeletingReply, setIsDeletingReply] = useState<string | null>(null); // Track which reply is being deleted

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);
      toast(response.data.message);
      onMessageDelete(message._id as string);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast('Error', {
        description: axiosError.response?.data.message ?? 'Failed to delete message',
      });
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      toast('Error', { description: 'Reply cannot be empty' });
      return;
    }
    console.log("message id", message._id);
    console.log("content", replyContent);

    setIsSubmittingReply(true);
    try {
      const response = await axios.post<ApiResponse>('/api/reply-message', {
        messageId: message._id,
        replyContent,
      });
      toast(response.data.message);

      const updatedMessage = {
        ...message,
        replies: [...(message.replies || []), { content: replyContent, createdAt: new Date() }],
      };
      console.log("updated message log", updatedMessage);
      onMessageUpdate(updatedMessage);

      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast('Error', {
        description: axiosError.response?.data.message ?? 'Failed to send reply',
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReplyMessage = async (replyId: string) => {
    console.log("Deleting reply with ID:", replyId);
    setIsDeletingReply(replyId);
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-reply-message/${replyId}`);
      toast(response.data.message);

      // Update local state to remove the deleted reply
      const updatedMessage = {
        ...message,
        replies: (message.replies || []).filter(reply => reply._id !== replyId),
      };
      onMessageUpdate(updatedMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast('Error', {
        description: axiosError.response?.data.message ?? 'Failed to delete reply',
      });
    } finally {
      setIsDeletingReply(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Message</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this message from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardDescription>Received on {new Date(message.createdAt).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{message.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p>Sent anonymously</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => setIsReplying(!isReplying)}
        >
          {isReplying ? 'Cancel Reply' : 'Reply'}
        </Button>
        {isReplying && (
          <div className="mt-4 w-full">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply here..."
              className="mb-2"
            />
            <Button
              onClick={handleReplySubmit}
              disabled={isSubmittingReply || !replyContent.trim()}
            >
              {isSubmittingReply ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send Reply'
              )}
            </Button>
          </div>
        )}
        {message.replies && message.replies.length > 0 && (
          <div className="mt-4 w-full">
            <h4 className="text-sm font-semibold">Replies:</h4>
            {message.replies.map((reply, index) => (
              <div key={reply._id || index} className="mt-2 pl-4 border-l-2 border-gray-200 flex justify-between">
                <div>
                  <p className="text-gray-700">{reply.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(reply.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Button
                    className="cursor-pointer p-1 bg-red-500 text-white rounded-md"
                    onClick={() => handleDeleteReplyMessage(reply._id)}
                    disabled={isDeletingReply === reply._id}
                  >
                    {isDeletingReply === reply._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LucideTrash />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default MessageCard;