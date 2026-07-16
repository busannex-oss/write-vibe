import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PIBForm from "@/components/pib/PIBForm";
import PIBSummary from "@/components/pib/PIBSummary";

export default function PIBQuestionnaire({ user }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: pibs = [], isLoading } = useQuery({
    queryKey: ['pib', user?.email],
    queryFn: () => base44.entities.PIBQuestionnaire.filter({}, '-created_date', 1),
    enabled: !!user,
  });

  const existingPIB = pibs[0];

  const handleSaved = () => {
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ['pib', user?.email] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!existingPIB || editing) {
    return <PIBForm user={user} existingPIB={existingPIB} onSaved={handleSaved} onCancel={() => setEditing(false)} />;
  }

  return <PIBSummary pib={existingPIB} onEdit={() => setEditing(true)} />;
}