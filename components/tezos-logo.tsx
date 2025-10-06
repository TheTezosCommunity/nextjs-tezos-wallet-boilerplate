/**
 * TezosLogo Component
 *
 * A React component that renders the Tezos cryptocurrency logo as an SVG.
 * The logo adapts to the current theme color and supports custom styling
 * through className props.
 *
 * Features:
 * - Vector-based scaling
 * - Theme-aware coloring
 * - Custom class support
 * - Accessible SVG attributes
 * - Default size of 11x13 pixels
 *
 * @module UI
 * @category Brand
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TezosLogo />
 *
 * // With custom styling
 * <TezosLogo className="text-blue-500 h-6 w-6" />
 *
 * // In a price display
 * <div className="flex items-center">
 *   <TezosLogo className="mr-1" />
 *   <span>1.5</span>
 * </div>
 * ```
 */

import type React from "react";
import { cn } from "@/lib/utils";

interface TezosLogoProps {
    className?: string;
}

const TezosLogo: React.FC<TezosLogoProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 193 237"
        className={cn("h-9 w-11 text-current", className)}
    >
        <title>Tezos Logo</title>
        <path
            fill="currentColor"
            d="M175.8,171.2c-2.3-40.7-53.5-59.2-58.4-61.1c-0.2-0.1-0.2-0.3-0.1-0.5l52.8-53v-5.7c0-0.9-0.8-1.7-1.7-1.7H71.1
	V17.3l0,0V7.7l-35.9,7.5v5.4h2c0,0,8.8,0,8.8,8.8v19.7H18.2c-0.5,0-1,0.5-1,1v12.5h28.9c0,0,0,13.3,0,28.8v39.1
	c0,21.3,13.7,36.1,37.7,34.1c5.1-0.4,9.8-2.4,13.8-5c1.8-1.2,2.9-3.1,2.9-5.3v-6.7c-7.8,5.2-14.4,4.9-14.4,4.9
	c-15.2,0-14.9-19.3-14.9-19.3V62.6h70l-50.4,50.8c-0.1,6.7-0.2,11.9-0.2,12c0,0.2,0.1,0.3,0.3,0.3c46.2,7.8,58.7,37.7,58.7,46.4
	c0,0,5,42.3-37.3,45.2c0,0-27.7,1.2-32.6-9.9c-0.2-0.4,0-0.8,0.4-1c4.6-2.1,7.7-6.2,7.7-11.7c0-8.2-5-14.9-15.5-14.9
	c-8.5,0-15.5,6.7-15.5,14.9c0,0-4,35.6,55.4,34.6C180,228.1,175.8,171.2,175.8,171.2z"
        />
    </svg>
);

export default TezosLogo;
