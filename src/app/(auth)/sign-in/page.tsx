"use client"
import React, { useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts";
import { z } from "zod"
import Link from "next/link";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema } from "@/schemas/signupSchema";
import axios, { Axios, AxiosError } from "axios"
import { ApiResponse } from "@/types/apiResponse";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@react-email/components";
import { Input } from "@/components/ui/input";
const Page = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('')
  const [IsUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isFormSubmitting, setisFormSubmitting] = useState(false);
  const debouncedUsername = useDebounceValue(username, 300);
  const router = useRouter();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  })
  useEffect(() => {
    const checkUsernameUniqueness = async () => {
      if (debouncedUsername) {
        setIsUsernameChecking(true);
        setUsername("");
        try {
          const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`);
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsername(axiosError.response?.data.message ?? "error checking username")
        }
        finally {
          setIsUsernameChecking(false)
        }
      }
    }
    checkUsernameUniqueness();
  }, [debouncedUsername])
  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setisFormSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up");
      toast("success", {
        description: response.data.message,
      })
      router.replace(`/verify/${username}`)
      setisFormSubmitting(false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast("Signup Failed ", {
        description: errorMessage
      })
      setisFormSubmitting(false);
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input {...field} placeholder="username"/>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type="submit">Sign In</Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  
  );
}

export default Page;