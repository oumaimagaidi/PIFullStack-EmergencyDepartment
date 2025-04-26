"use client"
import { useState } from "react"
import { MessageSquare, AlertTriangle, Check, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const AnnotationMarker = ({ annotation, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  const getIcon = () => {
    switch (annotation.type) {
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "highlight":
        return <Check className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "question":
        return <HelpCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getBackgroundColor = () => {
    if (annotation.isResolved) {
      return "bg-green-500 hover:bg-green-600"
    }

    switch (annotation.type) {
      case "comment":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "highlight":
        return "bg-green-500 hover:bg-green-600"
      case "warning":
        return "bg-red-500 hover:bg-red-600"
      case "question":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-yellow-500 hover:bg-yellow-600"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute cursor-pointer rounded-full p-1.5 text-white ${getBackgroundColor()} transition-all ${
              isHovered ? "scale-110" : ""
            }`}
            style={{
              left: `${annotation.position.x}%`,
              top: `${annotation.position.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
            onClick={() => onClick(annotation)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {getIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="max-w-xs">
            <p className="font-medium text-xs">{annotation.authorId?.username || "Utilisateur"}</p>
            <p className="text-xs truncate">{annotation.text}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default AnnotationMarker
