import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronDown,
  HomeIcon,
  LeafyGreenIcon,
  LogOutIcon,
  ProjectorIcon,
  Settings,
  SettingsIcon,
  Square,
  TrophyIcon,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import "../App.css";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";

type SidebarChild = {
  title: string;
  icon: LucideIcon;
  url?: string;
  action?: () => void | Promise<void>;
};

type SidebarItem = SidebarChild & {
  children?: SidebarChild[];
};

export default function AppLayout() {
  const [openModal, setOpenModal] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const lastSegment = location.pathname.split("/").filter(Boolean).pop();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const items = useMemo<SidebarItem[]>(
    () => [
      {
        title: "Dashboard",
        icon: HomeIcon,
        url: "/dashboard",
      },
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
          {
            title: "Product Variant",
            url: "/ordermgmt/productvariant",
            icon: TrophyIcon,
          },
          {
            title: "Attribute Definitions",
            url: "/ordermgmt/attributedeinitions",
            icon: SettingsIcon,
          },
          {
            title: "Cogs Definition",
            url: "/ordermgmt/cogsdefinitions",
            icon: SettingsIcon,
          },
          {
            title: "Order Analytics",
            url: "/ordermgmt/orderanalytics",
            icon: SettingsIcon,
          },
          {
            title: "Tags",
            url: "/ordermgmt/tags",
            icon: SettingsIcon,
          },
        ],
      },
      {
        title: "Page Management",
        icon: HomeIcon,
        children: [
          {
            title: "General Pages",
            url: "/pagmgmt/general",
            icon: Square,
          },
          {
            title: "Navigation Items",
            url: "/pagmgmt/navigationitem",
            icon: Square,
          },
        ],
      },

      {
        title: "Settings",
        icon: SettingsIcon,
        children: [
          // {
          //   title: "Settings",
          //   url: "/settings",
          //   icon: SettingsIcon,
          // },
          {
            title: "Logout",
            icon: LogOutIcon,
            action: async () => {
              await logout();
              navigate("/login");
            },
          },
          {
            title: "Theme Select",
            icon: Settings,
            action: () => setOpenModal(true),
          },
        ],
      },
    ],
    [logout, navigate],
  );

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
      title: "Eleganteh",
      heading: "#000000",
      description: "#4A4E69",
      subText: "#9A8C98",
      backgroundSecondary: "#FFFFFF",
      backgroundPrimary: "#F0F1EC",
      action: "#FFCB44",
      actionHover: "#e6b530",
      state: "#056B6A",
      stateLight: "rgba(5,107,106,0.10)",
      actionLight: "rgba(255,203,68,0.15)",
      border: "rgba(74,78,105,0.12)",
      shadow: "rgba(74,78,105,0.08)",
    },
    {
      title: "Dark Eleganteh",
      heading: "#F0EEE9",
      description: "#B8B8CC",
      subText: "#6E6A7C",
      backgroundSecondary: "#1C1C26",
      backgroundPrimary: "#13131A",
      action: "#FFCB44",
      actionHover: "#e6b530",
      state: "#09948F",
      stateLight: "rgba(9,148,143,0.12)",
      actionLight: "rgba(255,203,68,0.12)",
      border: "rgba(240,238,233,0.07)",
      shadow: "rgba(0,0,0,0.35)",
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
    {
      title: "Dark Theme",
      heading: "#FFFFFF",
      description: "#C7C7C7",
      subText: "#8A8A8A",
      backgroundPrimary: "#09090b",
      backgroundSecondary: "#111114",
      Action: "#FFD35A",
      State: "#19A7A5",
    },
    {
      title: "AdminNeutral",
      heading: "#1a1a2e",
      description: "#4A4E69",
      subText: "#9A8C98",
      backgroundSecondary: "#FFFFFF",
      backgroundPrimary: "#f7f7f8",
      action: "#7c6fd4",
      actionHover: "#6b5ec7",
      state: "#2d6a4f",
      stateLight: "rgba(45,106,79,0.10)",
      actionLight: "rgba(124,111,212,0.12)",
      border: "rgba(74,78,105,0.11)",
      shadow: "rgba(74,78,105,0.07)",
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
                    if (!item.children && item.url) {
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

                    if (!item.children) {
                      return null;
                    }

                    const children = item.children;
                    const isActiveGroup = children.some(
                      (child) =>
                        child.url && location.pathname.startsWith(child.url),
                    );
                    const open = openGroups[item.title] ?? isActiveGroup;

                    return (
                      <Collapsible
                        key={item.title}
                        open={open}
                        onOpenChange={(nextOpen) =>
                          setOpenGroups((current) => ({
                            ...current,
                            [item.title]: nextOpen,
                          }))
                        }
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
                                  {children.map((child) => (
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
            <Outlet key={location.pathname} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
