"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import React from "react";
import { ChevronRight } from "lucide-react";
import { unslug } from "@/lib/slug";

function getBreadcrumbs(pathname: string) {
  // Remove query/hash, split, and filter empty
  const segments = pathname.split("/").filter(Boolean);
  // Always start with Home
  const crumbs = [
    {
      name: "Home",
      href: "/",
    },
    ...segments.map((seg, idx) => {
      // Build href up to this segment
      const href =
        "/" + segments.slice(0, idx + 1).join("/");
      // Capitalize segment for display
      const name = seg.charAt(0).toUpperCase() + seg.slice(1);
      return { name, href };
    }),
  ];
  return crumbs;
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            {idx > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <BreadcrumbItem>
              {idx === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>
                  {decodeURIComponent(unslug(crumb.name))}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
