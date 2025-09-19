"use client"
import React, { useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts";
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema } from "@/schemas/signupSchema";
import axios, { Axios, AxiosError } from "axios"
import { ApiResponse } from "@/types/apiResponse";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@react-email/components";
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
  return (<>

    {toast("Event has been created.")}
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Username
              </FormLabel>
              <FormControl>
                <input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                This is the Display name
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  </>
  )
}

export default Page;