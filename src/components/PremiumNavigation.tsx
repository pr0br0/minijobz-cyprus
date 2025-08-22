"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Home, 
  Briefcase, 
  Users, 
  Bell, 
  User, 
  Settings,
  Search,
  LogOut,
  ChevronDown,
  Star,
  Zap,
  Crown,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  isPremium?: boolean;
}

interface PremiumNavigationProps {
  userRole?: "JOB_SEEKER" | "EMPLOYER" | "ADMIN";
}

export default function PremiumNavigation({ userRole }: PremiumNavigationProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const jobSeekerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard/job-seeker", icon: Home },
    { label: "Browse Jobs", href: "/jobs", icon: Briefcase },
    { label: "Applications", href: "/applications", icon: Users },
    { label: "Job Alerts", href: "/job-alerts", icon: Bell, badge: 2 },
    { label: "Companies", href: "/companies", icon: Briefcase },
    { 
      label: "Premium Features", 
      href: "/premium", 
      icon: Crown, 
      isPremium: true 
    },
  ];

  const employerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard/employer", icon: Home },
    { label: "Post a Job", href: "/jobs/post", icon: Briefcase },
    { label: "Manage Jobs", href: "/jobs/manage", icon: Briefcase },
    { label: "Applications", href: "/dashboard/employer/applications", icon: Users, badge: 5 },
    { label: "Analytics", href: "/dashboard/employer/analytics", icon: Star },
    { 
      label: "Premium Tools", 
      href: "/employer/premium", 
      icon: Zap, 
      isPremium: true 
    },
  ];

  const adminNavItems: NavItem[] = [
    { label: "Admin Panel", href: "/admin", icon: Settings },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "GDPR", href: "/dashboard/gdpr", icon: Bell },
    { label: "Payments", href: "/admin/payments", icon: Star },
  ];

  const navItems = userRole === "EMPLOYER" 
    ? employerNavItems 
    : userRole === "ADMIN" 
    ? adminNavItems 
    : jobSeekerNavItems;

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleSignOut = async () => {
    await router.push("/api/auth/signout");
  };

  return (
    <>
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" 
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                >
                  <Briefcase className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cyprus Jobs
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative"
                >
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        pathname === item.href
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.isPremium && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Crown className="w-4 h-4 text-yellow-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => toggleDropdown("notifications")}
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {notificationCount}
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              {/* User Dropdown */}
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDropdown("user")}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="font-medium">{session?.user?.name || "User"}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {activeDropdown === "user" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                    >
                      <Link href="/profile">
                        <motion.div
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          className="flex items-center space-x-3 px-4 py-2 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">Profile Settings</span>
                        </motion.div>
                      </Link>
                      <Link href="/settings">
                        <motion.div
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          className="flex items-center space-x-3 px-4 py-2 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">Account Settings</span>
                        </motion.div>
                      </Link>
                      <hr className="my-2" />
                      <motion.div
                        whileHover={{ backgroundColor: "#fef2f2" }}
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Sign Out</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200 md:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          pathname === item.href
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {item.isPremium && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Premium */}
      {userRole && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <Link href={userRole === "EMPLOYER" ? "/employer/premium" : "/premium"}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg rounded-full w-14 h-14 p-0"
              >
                <Crown className="w-6 h-6" />
              </Button>
            </Link>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}