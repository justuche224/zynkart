import { ArrowDown, ArrowUp } from "lucide-react";
import formatPrice from "@/lib/price-formatter";

export const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = "number",
    period = "last period",
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ElementType;
    format?: string;
    period?: string;
  }) => {
    const isPositive = change > 0;
    const formattedValue =
      format === "currency"
        ? formatPrice(value)
        : format === "percentage"
        ? `${value}%`
        : value.toLocaleString();

    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {formattedValue}
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          {isPositive ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-sm font-medium ml-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">{period}</span>
        </div>
      </div>
    );
  };