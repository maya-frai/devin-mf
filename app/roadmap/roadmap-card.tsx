"use client";

import { useState } from "react";
import { PromptOutput } from "@/components/prompt-output";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildToolPrompt, type ToolRequest } from "@/lib/tool-prompt";

export function RoadmapCard({ item }: { item: ToolRequest & { problem: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.problem}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {item.capabilities?.map((c) => (
            <Badge key={c} variant={c === "Money movement" ? "destructive" : "secondary"}>{c}</Badge>
          ))}
        </div>
        <Button size="sm" variant={open ? "outline" : "default"} onClick={() => setOpen(!open)}>
          {open ? "Hide prompt" : "Generate Devin prompt"}
        </Button>
        {open ? <PromptOutput prompt={buildToolPrompt(item)} /> : null}
      </CardContent>
    </Card>
  );
}
