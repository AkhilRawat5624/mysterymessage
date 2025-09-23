"use client"
import React, { useEffect, useState } from "react"
import { useDebounceValue, useDebounceCallback} from "usehooks-ts";
import { z } from "zod"
import Link from "next/link";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import Loader2, { Loader, Loader2Icon, LucideLoader2 } from "lucide-react"
// import { Form, useForm } from "react-hook-form";
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema } from "@/schemas/signupSchema";
import axios, { Axios, AxiosError } from "axios"
import { ApiResponse } from "@/types/apiResponse";
// import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { log } from "console";
const Page = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('')
  const [IsUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isFormSubmitting, setisFormSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 300);
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
      if (username) {
        setIsUsernameChecking(true);
        // setUsername("");
        console.log("uesrname========>",username);
        
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`);
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
  }, [username])
  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setisFormSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
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
          <p className="mb-4">Register to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input {...field} placeholder="username" onChange={(e)=>{
                    field.onChange(e);
                    debounced(e.target.value);
                  }}/>
                  {
                    IsUsernameChecking && <Loader2Icon className="animate-spin"/>
                  }
                  <p className={`text-sm ${usernameMessage === "user is available" ? "text-green-500" : "text-red-500"}`}>test {usernameMessage}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} placeholder="email" />
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
                  <Input type="password" {...field} placeholder="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type="submit" >
              {
                isFormSubmitting ? (
                  <>
                  <LucideLoader2 className="mr-2 h-4 w-4 animate-spin"/>Please Wait
                  </>
                ) : (
                 "Sign Up"
                )
              }
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>

  );
}

export default Page;