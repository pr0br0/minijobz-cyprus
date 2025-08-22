"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Eye,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  Zap,
  BarChart3,
  Activity,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  totalViews: number;
  totalApplications: number;
  profileViews: number;
  savedJobs: number;
  interviewRate: number;
  responseRate: number;
  averageResponseTime: number;
  activeJobs: number;
}

interface ActivityItem {
  id: string;
  type: 'APPLICATION' | 'PROFILE_VIEW' | 'JOB_SAVED' | 'INTERVIEW';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

interface PremiumDashboardProps {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  recommendations?: string[];
}

export default function PremiumDashboard({ 
  stats, 
  recentActivity, 
  recommendations = [] 
}: PremiumDashboardProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const statCards = [
    {
      title: "Profile Views",
      value: stats.profileViews,
      change: 12,
      icon: Eye,
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      change: 8,
      icon: Briefcase,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Interview Rate",
      value: stats.interviewRate,
      change: 15,
      icon: CheckCircle,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      suffix: "%",
    },
    {
      title: "Response Rate",
      value: stats.responseRate,
      change: -5,
      icon: Activity,
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-50",
      suffix: "%",
    },
  ];

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Header with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your Career Dashboard
        </motion.h1>
        <motion.p 
          className="text-gray-600 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Track your job search progress and get insights
        </motion.p>
      </motion.div>

      {/* Stats Grid with Hover Effects */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index + 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
          >
            <Card className={`h-full overflow-hidden transition-all duration-300 ${
              selectedStat === stat.title ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-lg hover:shadow-xl'
            }`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center space-x-1"
                  >
                    {getChangeIcon(stat.change)}
                    <span className={`text-sm font-medium ${getChangeColor(stat.change)}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * index + 0.7, type: "spring", stiffness: 200 }}
                >
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    {stat.suffix}
                  </div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Job Search Progress</span>
            </CardTitle>
            <CardDescription>
              Track your progress towards finding your dream job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1, ease: "easeOut" }}
            >
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profile Completion</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Applications Sent</span>
                    <span className="font-medium">{stats.totalApplications}/50</span>
                  </div>
                  <Progress value={(stats.totalApplications / 50) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Interview Success</span>
                    <span className="font-medium">{stats.interviewRate}%</span>
                  </div>
                  <Progress value={stats.interviewRate} className="h-2" />
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Boost your job search with these actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview Prep
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Market Insights
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <Button 
                className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <Award className="w-4 h-4 mr-2" />
                Get AI Recommendations
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Recommendations */}
      <AnimatePresence>
        {showRecommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-gradient-to-r from-purple-400 to-pink-400">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Personalized suggestions to improve your job search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-sm text-purple-800">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest job search activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}