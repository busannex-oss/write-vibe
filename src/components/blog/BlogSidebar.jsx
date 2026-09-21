import React from "react";
import SidebarLoginCard from "@/components/blog/SidebarLoginCard";
import PopularPostsList from "@/components/blog/PopularPostsList";
import PopularCategoriesList from "@/components/blog/PopularCategoriesList";
import PartnerFeaturedPosts from "@/components/blog/PartnerFeaturedPosts";
import SidebarAdRotator from "@/components/blog/SidebarAdRotator";

export default function BlogSidebar({ posts, activeTag, onSelectTag }) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-6 h-fit">
      <SidebarLoginCard />
      <SidebarAdRotator />
      <PopularPostsList posts={posts} />
      <PopularCategoriesList posts={posts} activeTag={activeTag} onSelect={onSelectTag} />
      <PartnerFeaturedPosts />
    </aside>
  );
}