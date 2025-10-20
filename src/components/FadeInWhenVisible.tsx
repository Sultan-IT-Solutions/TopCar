// src/components/FadeInWhenVisible.tsx
'use client'

import { motion, useAnimation, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  delay?: number
  className?: string
}

export default function FadeInWhenVisible({ children, delay = 0.15, className = '' }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0 })
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={controls}
      transition={{ duration: 0.6, delay, ease: "easeOut" }} // Added explicit ease: "easeOut"
      className={className}
    >
      {children}
    </motion.div>
  )
}