import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface PeopleGridProps {
  children: React.ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/**
 * Responsive grid for people cards with staggered entrance animation.
 * Wraps each child in a motion.div for animation.
 * Use `PeopleGridItem` as direct children for proper staggering.
 */
export function PeopleGrid({ children, className }: PeopleGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wrapper for individual items inside PeopleGrid.
 * Applies staggered entrance animation.
 */
export function PeopleGridItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
