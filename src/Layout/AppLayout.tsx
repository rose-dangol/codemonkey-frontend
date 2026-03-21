import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  ChevronDown,
  HomeIcon,
  icons,
  LeafyGreenIcon,
  LogOutIcon,
  ProjectorIcon,
  Settings,
  SettingsIcon,
  Square,
  TrophyIcon,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "./Modal";
import "../App.css";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function AppLayout() {
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();
  const lastSegment = location.pathname.split("/").filter(Boolean).pop();

  const items = [
    {
      title: "Order Management",
      icon: HomeIcon,
      children: [
        {
          title: "Overview",
          url: "/ordermgmt/overview",
          icon: Square,
        },
        {
          title: "Category",
          url: "/ordermgmt/category",
          icon: LeafyGreenIcon,
        },
        {
          title: "Brands",
          url: "/ordermgmt/brands",
          icon: ProjectorIcon,
        },
        {
          title: "Products",
          url: "/ordermgmt/products",
          icon: TrophyIcon,
        },
      ],
    },
    {
      title: "Dashboard",
      icon: HomeIcon,
      url: "/dashboard",
    },
    {
      title: "Settings",
      icon: SettingsIcon,
      children: [
        {
          title: "Settings",
          url: "/settings",
          icon: SettingsIcon,
        },
        {
          title: "Logout",
          url: "/logout",
          icon: LogOutIcon,
        },
        {
          title: "Theme Select",
          icon: Settings,
          action: () => setOpenModal(true),
        },
      ],
    },
  ];

  const sentObject = [
    {
      title: "Soft Lavender",
      heading: "#000",
      description: "#4A4E69",
      subText: "#9A8C98",
      backgroundSecondary: "#FFFFFF",
      backgroundPrimary: "#F0F1EC",
      Action: "#FFCB44",
      State: "#056B6A",
    },
    {
      title: "Thor: Love and Thunder",
      heading: "#ede0d4", // bright, readable heading
      description: "#e6ccb2", // warm gold accent
      subText: "#ddb892", // muted secondary text
      backgroundPrimary: "#7f5539", // rich dark base
      backgroundSecondary: "#b08968", // elevated surfaces / cards
    },

    {
      title: "Rustic Earthy Tones",
      heading: "#7F5539",
      description: "#A68A64",
      subText: "#EDE0D4",
      backgroundSecondary: "#656D4A",
      backgroundPrimary: "#414833",
    },
    {
      title: "Soft Serenity",
      heading: "#D3AB9E",
      description: "#EAC9C1",
      subText: "#EBD8D0",
      backgroundSecondary: "#FFFBFa",
      backgroundPrimary: "#FEFEFF",
    },
  ];

  const submenuVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      y: -4,
    },
    visible: {
      height: "auto",
      opacity: 1,
      y: 0,
    },
  };

  const saveLocalStorage = (data: {
    title: string;
    heading: string;
    description: string;
    subText: string;
    backgroundSecondary: string;
    backgroundPrimary: string;
    Action: string;
    State: string;
    hoverColor: string | null | undefined;
  }) => {
    localStorage.setItem("theme", JSON.stringify(data));
  };

  const stored = localStorage.getItem("theme");


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-primary ">
        <Sidebar>
          <SidebarContent className="bg-secondary">
            <SidebarGroup>
              <SidebarGroupLabel className="sub-text">
                Application
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const [open, setOpen] = useState(false);

                    if (!item.children) {
                      return (
                        <SidebarMenuItem key={item.title} className="w-full">
                          <SidebarMenuButton
                            asChild
                            className="w-full justify-start"
                          >
                            <Link
                              to={item.url}
                              className={`sidebar-menu-hover py-2 rounded-full transition ${
                                lastSegment ===
                                item?.url?.split("/").filter(Boolean).pop()
                                  ? "action"
                                  : "bg-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {" "}
                                {/* ← added wrapping div */}
                                <item.icon className="description-text" />
                                <span className="description-text">
                                  {item.title}
                                </span>
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    return (
                      <Collapsible
                        key={item.title}
                        open={open}
                        onOpenChange={setOpen}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full flex justify-between">
                              <div className="flex items-center gap-2">
                                <item.icon className="description-text" />
                                <span className="description-text">
                                  {item.title}
                                </span>
                              </div>

                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div
                                key="submenu"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={submenuVariants}
                                transition={{
                                  duration: 0.25,
                                  ease: "easeInOut",
                                }}
                                className="overflow-hidden"
                              >
                                <SidebarMenu className="ml-6 mt-1">
                                  {item.children.map((child) => (
                                    <SidebarMenuItem
                                      key={child.title}
                                      className="w-[88%]"
                                    >
                                      <SidebarMenuButton asChild>
                                        {child.url ? (
                                          <Link
                                            to={child.url}
                                            className={`sidebar-menu-hover px-4 py-2 rounded-full transition ${
                                              lastSegment ===
                                              child?.url
                                                ?.split("/")
                                                .filter(Boolean)
                                                .pop()
                                                ? "action"
                                                : "bg-transparent"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <child.icon className="description-text" />
                                              <span className="description-text">
                                                {child.title}
                                              </span>
                                            </div>
                                          </Link>
                                        ) : (
                                          <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={child.action}
                                          >
                                            <child.icon className="description-text" />
                                            <span className="description-text">
                                              {child.title}
                                            </span>
                                          </div>
                                        )}
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  ))}
                                </SidebarMenu>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <Modal
          open={openModal}
          setOpen={setOpenModal}
          sentObject={sentObject}
          saveLocalStorage={saveLocalStorage}
        />

        <div className="flex-1">
          <SidebarTrigger />
          <div className="px-10">

          <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
