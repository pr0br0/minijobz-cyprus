"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  MapPin, 
  Briefcase, 
  Clock,
  Euro,
  Heart,
  Share2,
  Eye,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  featured: boolean;
  urgent: boolean;
  postedAt: string;
  logo?: string;
  matchScore?: number;
}

interface PremiumJobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onShare?: (job: Job) => void;
  className?: string;
}

export default function PremiumJobCard({ 
  job, 
  onSave, 
  onShare, 
  className = "" 
}: PremiumJobCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMatchScore, setShowMatchScore] = useState(false);

  useEffect(() => {
    // Animate match score on mount
    const timer = setTimeout(() => setShowMatchScore(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(job.id);
  };

  const handleShare = () => {
    onShare?.(job);
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return "Competitive";
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryCurrency}${job.salaryMin.toLocaleString()} - ${job.salaryCurrency}${job.salaryMax.toLocaleString()}`;
    }
    return job.salaryMin 
      ? `${job.salaryCurrency}${job.salaryMin.toLocaleString()}+`
      : `Up to ${job.salaryCurrency}${job.salaryMax?.toLocaleString()}`;
  };

  const formatPostedAt = () => {
    const posted = new Date(job.postedAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className={`relative ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`h-full overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-xl ring-2 ring-blue-500/20' : 'shadow-lg'
      } ${job.featured ? 'border-gradient-to-r from-yellow-400 to-yellow-600' : ''}`}>
        {/* Featured Badge */}
        {job.featured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute top-4 right-4 z-10"
          >
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </motion.div>
        )}

        {/* Urgent Badge */}
        {job.urgent && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute top-4 left-4 z-10"
          >
            <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
              Urgent
            </Badge>
          </motion.div>
        )}

        {/* Match Score */}
        {job.matchScore && (
          <AnimatePresence>
            {showMatchScore && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="absolute top-4 left-4 z-10"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {job.matchScore}%
                  </div>
                  <TrendingUp className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full p-0.5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <CardContent className="p-6">
          {/* Company Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex items-center mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-3">
              {job.logo ? (
                <img src={job.logo} alt={job.company} className="w-8 h-8 rounded" />
              ) : (
                <span className="text-lg font-bold text-gray-600">
                  {job.company.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-semibold text-gray-900"
              >
                {job.company}
              </motion.h3>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center text-sm text-gray-500"
              >
                <Clock className="w-4 h-4 mr-1" />
                {formatPostedAt()}
              </motion.div>
            </div>
          </motion.div>

          {/* Job Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
          >
            {job.title}
          </motion.h2>

          {/* Job Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2 mb-4"
          >
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="text-sm">{job.type}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Euro className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{formatSalary()}</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between pt-4 border-t border-gray-100"
          >
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className={`transition-colors ${isSaved ? 'text-red-500 border-red-200 hover:bg-red-50' : ''}`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </motion.div>
            </div>
            
            <Link href={`/jobs/${job.id}`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View Job
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Premium Job Carousel Component
interface PremiumJobCarouselProps {
  jobs: Job[];
  onSave?: (jobId: string) => void;
  onShare?: (job: Job) => void;
}

export function PremiumJobCarousel({ jobs, onSave, onShare }: PremiumJobCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const handlePrevious = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? jobs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev === jobs.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enterRight: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    enterLeft: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection > 0 ? 'right' : 'left');
    setCurrentIndex((prev) => (prev === jobs.length - 1 ? 0 : prev + 1));
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No jobs available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enterRight"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <PremiumJobCard
            job={jobs[currentIndex]}
            onSave={onSave}
            onShare={onShare}
            className="w-full"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevious}
          className="ml-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </motion.button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="mr-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </motion.button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {jobs.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              setDirection(index > currentIndex ? 'right' : 'left');
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}