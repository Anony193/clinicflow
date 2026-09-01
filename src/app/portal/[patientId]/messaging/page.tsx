'use client';

/**
 * Portal Messaging Page (TASK-039)
 */

import { useState } from 'react';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function PortalMessagingPage({ params }: { params: { patientId: string } }) {
  const [body, setBody] = useState('');
  const messages = trpc.messages.list.useQuery({ patientId: params.patientId, limit: 50 });
  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setBody('');
      messages.refetch();
    },
  });

  function handleSend() {
    if (!body.trim()) return;
    sendMutation.mutate({ patientId: params.patientId, body });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/portal/${params.patientId}`}><ArrowLeft className="h-4 w-4" />Back</Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Messages
        </h1>
      </div>

      <Card className="elevation-1">
        <CardHeader><CardTitle className="text-md">Conversation</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto mb-4">
            {messages.data?.items.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderRole === 'patient' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 max-w-[70%] ${msg.senderRole === 'patient' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm">{msg.body}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.senderName} · {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )) ?? <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[60px] motion-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={!body.trim() || sendMutation.isPending} className="motion-base">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
