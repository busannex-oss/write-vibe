import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, ArrowRight } from "lucide-react";

export default function TasksWidget({ user }) {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['dashboardTasks', user?.email],
    queryFn: () => base44.entities.DashboardTask.filter({ user_email: user.email, completed: false }, '-created_date', 10),
    enabled: !!user?.email,
    staleTime: 30000,
  });

  const completeMutation = useMutation({
    mutationFn: (taskId) => base44.entities.DashboardTask.update(taskId, { completed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboardTasks'] }),
  });

  if (!tasks.length) return null;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="border-b border-white/5 pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-amber-400" />
          Your Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-white/5">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-4">
            <Checkbox
              checked={false}
              onCheckedChange={() => completeMutation.mutate(task.id)}
              className="mt-0.5 border-white/30 data-[state=checked]:bg-amber-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{task.title}</p>
              {task.description && (
                <p className="text-xs text-white/50 mt-1">{task.description}</p>
              )}
              {task.link_page && (
                <Link
                  to={createPageUrl(task.link_page)}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2"
                >
                  Go to it <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}