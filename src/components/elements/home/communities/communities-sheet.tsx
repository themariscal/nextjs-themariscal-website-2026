
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { CommunitiesContent } from "./communities-content";
import { CommunitiesFooter } from "./communities-footer";
import { popularCommunities } from "../../../../data/dummy/dummy-data";

export function CommunitiesSheet() {
    const t = useTranslations("settings");

    return (
        <Tooltip>
            <Sheet>
                <SheetTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            Comunidades
                            <Menu className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                </SheetTrigger>
                <TooltipContent>{t("tooltip")}</TooltipContent>
                <SheetContent className="px-4">
                    <SheetHeader>
                        <SheetTitle>Comunidades Populares</SheetTitle>
                    </SheetHeader>

                    <CommunitiesContent communities={popularCommunities} showCard={false} showTitle={false} />
                    <CommunitiesFooter />

                </SheetContent>
            </Sheet>
        </Tooltip>
    );
}
