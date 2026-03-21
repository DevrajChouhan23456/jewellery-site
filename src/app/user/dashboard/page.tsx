import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { Separator } from "../../../components/ui/separator";
import { AppSidebar } from "../../../components/app-sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { FileText, ImageIcon, Mail, Users } from "lucide-react";
import prisma from "../../../lib/prisma"; // ✅ make sure this is server-side only
import Link from "next/link";
import { Particles } from "../../../components/magicui/particles";
import { BentoCard, BentoGrid } from "../../../components/magicui/bento-grid";
import { Marquee } from "../../../components/magicui/marquee";
import {
  TrendingUp,
  Users as UsersIcon,
  Images,
  FileText as FileTextIcon,
  Folder,
  MessageSquare,
} from "lucide-react";

export default async function Dashboard() {
  // ✅ Fetch counts from Prisma (only models that exist)
  const [
    noticeCount,
    galleryCount,
    contactCount,
    teacherCount,
    documentCount,
    sliderCount,
  ] = await Promise.all([
    prisma.notice.count(),
    prisma.gallery.count(),
    prisma.contact.count(),
    prisma.teacher.count(),
    prisma.document.count(),
    prisma.slider.count(),
  ]);

  // Website Visitors (static for now)
  const websiteVisitors = 1234;

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 items-center gap-2 px-4 border-b bg-gradient-to-r from-muted/50 to-background">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/user/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto text-sm text-muted-foreground">{today}</div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background">
            <Particles
              className="absolute inset-0"
              quantity={80}
              color="#888888"
            />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back, Admin
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track content, manage media, and stay on top of updates.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-md border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Live overview
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Notices
                </CardTitle>
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{noticeCount}</div>
                <p className="text-xs text-muted-foreground">
                  +2 new this week
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gallery Images
                </CardTitle>
                <Images className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{galleryCount}</div>
                <p className="text-xs text-muted-foreground">
                  Updated recently
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Contact Inquiries
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contactCount}</div>
                <p className="text-xs text-muted-foreground">
                  Response SLA: 24h
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Animate the number when it changes */}
                <div className="text-2xl font-bold transition-all duration-500 ease-out">
                  {teacherCount}
                </div>
                <p className="text-xs text-muted-foreground">Active staff</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documentCount}</div>
                <p className="text-xs text-muted-foreground">
                  PDFs & resources
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Slider Images
                </CardTitle>
                <Images className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sliderCount}</div>
                <p className="text-xs text-muted-foreground">
                  Homepage carousel
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions via Bento Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <BentoGrid className="grid-cols-1 md:grid-cols-3 auto-rows-[14rem]">
                  <BentoCard
                    name="Manage Notices"
                    description="Create, edit and publish school notices."
                    href="/user/dashboard/notice"
                    cta="Open"
                    Icon={FileTextIcon}
                    className="col-span-1"
                    background={
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                    }
                  />
                  <BentoCard
                    name="Gallery"
                    description="Upload and organize images."
                    href="/user/dashboard/gallery"
                    cta="Open"
                    Icon={Images}
                    className="col-span-1"
                    background={
                      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-secondary/10 blur-2xl" />
                    }
                  />
                  <BentoCard
                    name="Teachers"
                    description="Manage staff profiles and roles."
                    href="/user/dashboard/teacher"
                    cta="Open"
                    Icon={UsersIcon}
                    className="col-span-1"
                    background={
                      <div className="absolute right-0 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-muted blur-2xl" />
                    }
                  />
                  <BentoCard
                    name="Documents"
                    description="Upload documents and resources."
                    href="/user/dashboard/documents"
                    cta="Open"
                    Icon={Folder}
                    className="col-span-1"
                    background={
                      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-2xl" />
                    }
                  />
                  <BentoCard
                    name="Slider Images"
                    description="Curate homepage carousel."
                    href="/user/dashboard/slider-image"
                    cta="Open"
                    Icon={Images}
                    className="col-span-1"
                    background={
                      <div className="absolute -right-6 -bottom-6 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
                    }
                  />
                  <BentoCard
                    name="Contact"
                    description="Review and respond to queries."
                    href="/user/dashboard/inquiry"
                    cta="Open"
                    Icon={MessageSquare}
                    className="col-span-1"
                    background={
                      <div className="absolute -left-6 -top-6 h-36 w-36 rounded-full bg-secondary/10 blur-2xl" />
                    }
                  />
                </BentoGrid>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Marquee pauseOnHover className="[--gap:2rem]">
                  <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
                    📢 New notice published — 2 hours ago
                  </div>
                  <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
                    🖼️ 5 new photos added — 4 hours ago
                  </div>
                  <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
                    📧 New inquiry received — 6 hours ago
                  </div>
                  <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
                    👨‍🏫 Teacher profile updated — 1 day ago
                  </div>
                </Marquee>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
