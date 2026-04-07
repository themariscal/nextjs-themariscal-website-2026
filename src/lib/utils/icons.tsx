import {
  ChevronDown,
  ChevronUp,
  Menu,
  Circle,
  RotateCcw,
  Smile,
  Gamepad2,
  MessageCircleQuestion,
  Cpu,
  Star,
  Film,
  Megaphone,
  BarChart3,
  HelpCircle,
  BookOpen,
  Wrench,
  Mic,
  Globe,
  Grid3X3,
  ScrollText,
  Scale,
  FileCheck,
  Accessibility,
  MessageCircle,
  Bell,
  Bookmark,
  MoreHorizontal,
  Home,
  Eye,
  Palette,
  TrendingUp,
  Truck,
  Sparkles,
  Utensils,
  TreePine,
  Headphones,
  Trees,
  Newspaper,
  Plane,
  FlaskConical,
  Activity,
  Zap,
  Car,
  Heart,
} from "lucide-react";

const DiscordIcon = () => (
  <div className="w-5 h-5 rounded-full bg-[#5865F2] flex items-center justify-center">
    <div className="w-3 h-3 bg-white rounded-sm"></div>
  </div>
);

const RedditIcon = () => (
  <div className="w-5 h-5 rounded-full bg-[#FF4500] flex items-center justify-center">
    <div className="w-3 h-3 bg-white rounded-full"></div>
  </div>
);

const RLogoIcon = () => (
  <div className="w-5 h-5 rounded-full bg-[#FF4500] flex items-center justify-center">
    <span className="text-white text-xs font-bold">r/</span>
  </div>
);

const HourglassIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <div className="w-3 h-4 border border-muted-foreground rounded-sm relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-muted-foreground"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-muted-foreground"></div>
    </div>
  </div>
);
export const renderIcon = (iconType: string) => {
  switch (iconType) {
    // Custom icons
    case 'discord':
      return <DiscordIcon />;
    case 'reddit':
      return <RedditIcon />;
    case 'r-logo':
      return <RLogoIcon />;
    case 'hourglass':
      return <HourglassIcon />;

    // Lucide icons
    case 'rotate-ccw':
      return <RotateCcw className="w-5 h-5" />;
    case 'smile':
      return <Smile className="w-5 h-5" />;
    case 'gamepad2':
      return <Gamepad2 className="w-5 h-5" />;
    case 'message-circle-question':
      return <MessageCircleQuestion className="w-5 h-5" />;
    case 'cpu':
      return <Cpu className="w-5 h-5" />;
    case 'star':
      return <Star className="w-5 h-5" />;
    case 'film':
      return <Film className="w-5 h-5" />;
    case 'megaphone':
      return <Megaphone className="w-5 h-5" />;
    case 'bar-chart3':
      return <BarChart3 className="w-5 h-5" />;
    case 'help-circle':
      return <HelpCircle className="w-5 h-5" />;
    case 'book-open':
      return <BookOpen className="w-5 h-5" />;
    case 'wrench':
      return <Wrench className="w-5 h-5" />;
    case 'mic':
      return <Mic className="w-5 h-5" />;
    case 'globe':
      return <Globe className="w-5 h-5" />;
    case 'grid3x3':
      return <Grid3X3 className="w-5 h-5" />;
    case 'scroll-text':
      return <ScrollText className="w-5 h-5" />;
    case 'scale':
      return <Scale className="w-5 h-5" />;
    case 'file-check':
      return <FileCheck className="w-5 h-5" />;
    case 'accessibility':
      return <Accessibility className="w-5 h-5" />;
    case 'message-circle':
      return <MessageCircle className="w-5 h-5" />;
    case 'bell':
      return <Bell className="w-5 h-5" />;
    case 'bookmark':
      return <Bookmark className="w-5 h-5" />;
    case 'more-horizontal':
      return <MoreHorizontal className="w-5 h-5" />;
    case 'home':
      return <Home className="w-5 h-5" />;

    // Additional category icons
    case 'eye':
      return <Eye className="w-5 h-5" />;
    case 'palette':
      return <Palette className="w-5 h-5" />;
    case 'trending-up':
      return <TrendingUp className="w-5 h-5" />;
    case 'truck':
      return <Truck className="w-5 h-5" />;
    case 'sparkles':
      return <Sparkles className="w-5 h-5" />;
    case 'utensils':
      return <Utensils className="w-5 h-5" />;
    case 'tree-pine':
      return <TreePine className="w-5 h-5" />;
    case 'headphones':
      return <Headphones className="w-5 h-5" />;
    case 'tree':
      return <Trees className="w-5 h-5" />;
    case 'newspaper':
      return <Newspaper className="w-5 h-5" />;
    case 'plane':
      return <Plane className="w-5 h-5" />;
    case 'flask-conical':
      return <FlaskConical className="w-5 h-5" />;
    case 'tennis':
      return <Activity className="w-5 h-5" />;
    case 'ufo':
      return <Zap className="w-5 h-5" />;
    case 'steering-wheel':
      return <Car className="w-5 h-5" />;
    case 'heart':
      return <Heart className="w-5 h-5" />;

    default:
      return <Circle className="w-5 h-5" />;
  }
};