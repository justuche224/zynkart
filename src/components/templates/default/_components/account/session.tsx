"use client";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCustomerSession,
  revokeCustomerSession,
} from "@/actions/customer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PiBrowser, PiDeviceMobile, PiGlobe } from "react-icons/pi";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const Session = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => await getAllCustomerSession(),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: revokeCustomerSession,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.success);
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <PiGlobe />;
    const lowercasedUA = userAgent.toLowerCase();
    if (lowercasedUA.includes("mobile")) return <PiDeviceMobile />;
    if (
      lowercasedUA.includes("windows") ||
      lowercasedUA.includes("macintosh") ||
      lowercasedUA.includes("linux")
    )
      return <PiBrowser />;
    return <PiGlobe />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-8 w-[80px]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          You can sign out of any session to protect your account. We will also
          let you know if we notice any unusual activity.
        </CardDescription>
      </CardHeader>
      <Separator />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.sessions.map((session, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="text-2xl text-muted-foreground">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {session.userAgent
                          ? session.userAgent
                          : "Unknown Device"}
                      </p>
                      {session.id === data?.currentSession?.id && (
                        <Badge>Current session</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{session.ipAddress || "Unknown"}</TableCell>
              <TableCell>
                {format(new Date(session.updatedAt), "PPP p")}
              </TableCell>
              <TableCell>
                {session.id === data?.currentSession?.id ? (
                  <span className="text-green-600 font-semibold">
                    Current Session
                  </span>
                ) : (
                  <Button
                    variant={"outline"}
                    onClick={() => mutate(session.id)}
                    disabled={isPending}
                  >
                    {isPending && (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Revoke
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default Session;
