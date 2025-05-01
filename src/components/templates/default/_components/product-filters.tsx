import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export function ProductFilters() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
            <span>Price Range</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4">
            <div className="space-y-4">
              <Slider defaultValue={[0, 100]} max={100} step={1} />
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">₦0</div>
                <div className="text-sm font-medium">₦100,000</div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Separator />
      </div>

      <div className="space-y-2">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
            <span>Categories</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="category-electronics" />
                <label
                  htmlFor="category-electronics"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Electronics
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="category-clothing" />
                <label
                  htmlFor="category-clothing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Clothing
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="category-home" />
                <label
                  htmlFor="category-home"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Home & Kitchen
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="category-beauty" />
                <label
                  htmlFor="category-beauty"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Beauty & Personal Care
                </label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Separator />
      </div>

      <div className="space-y-2">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
            <span>Availability</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" />
                <label
                  htmlFor="in-stock"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  In Stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="on-sale" />
                <label
                  htmlFor="on-sale"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  On Sale
                </label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Separator />
      </div>

      <div className="pt-4 flex items-center justify-between">
        <Button variant="outline" size="sm">
          Reset
        </Button>
        <Button size="sm">Apply Filters</Button>
      </div>
    </div>
  );
}
