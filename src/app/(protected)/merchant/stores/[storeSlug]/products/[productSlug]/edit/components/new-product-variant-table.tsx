"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
// import { useCurrentUser } from "@/hooks/use-current-user";

type Color = {
  id: string;
  name: string;
  value: string;
};

type Size = {
  id: string;
  name: string;
  value: string;
};

type Variant = {
  colorId?: string;
  sizeId?: string;
  sku?: string;
  price?: number;
  inStock?: number;
};

type NewColor = {
  name: string;
  value: string;
};
type NewSize = {
  name: string;
  value: string;
};

type AddColorForm = NewColor & {
  merchantId: string;
  storeProfileId: string;
  storeId: string;
};

type AddSizeForm = NewSize & {
  merchantId: string;
  storeProfileId: string;
  storeId: string;
};

interface ProductVariantsProps {
  colors?: Color[];
  sizes?: Size[];
  value: Variant[];
  onChange: (variants: Variant[]) => void;
  trackQuantity: boolean;
  basePrice: number;
  onAddColor: (stuff: AddColorForm) => Promise<Color>;
  onAddSize: (stuff: AddSizeForm) => Promise<Size>;
  storeProfileId: string;
  storeId: string;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  colors = [],
  sizes = [],
  value,
  onChange,
  trackQuantity,
  basePrice,
  onAddColor,
  onAddSize,
  storeProfileId,
  storeId,
}) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newColor, setNewColor] = useState<NewColor>({
    name: "",
    value: "#000000",
  });
  const [newSize, setNewSize] = useState<NewColor>({
    name: "",
    value: "",
  });
  const [colorError, setColorError] = useState<string>("");
  const [sizeError, setSizeError] = useState<string>("");
  // const merchant = useCurrentUser();

  // !WARNING: This is a temporary fix to avoid the error "useCurrentUser is not a function"
  // TODO: Remove this once we have a proper way to get the merchant
  const merchant = { id: "1" };

  const handleAddSize = async () => {
    try {
      setSizeError("");
      if (!newSize.name.trim()) {
        setSizeError("Size name is required");
        return;
      }
      if (!merchant?.id) return null;
      const addedSize = await onAddSize({
        name: newSize.name.trim(),
        value: newSize.value,
        storeProfileId,
        storeId,
        merchantId: merchant.id,
      });

      // Add the new Size to selected Sizes
      setSelectedSizes([...selectedSizes, addedSize.id]);

      // Reset form
      setNewSize({ name: "", value: "#000000" });
      setIsAddingSize(false);
    } catch (error) {
      setSizeError(
        error instanceof Error ? error.message : "Failed to add Size"
      );
    }
  };
  const handleAddColor = async () => {
    try {
      setColorError("");
      if (!newColor.name.trim()) {
        setColorError("Color name is required");
        return;
      }
      if (!merchant?.id) return null;
      const addedColor = await onAddColor({
        name: newColor.name.trim(),
        value: newColor.value,
        storeProfileId,
        storeId,
        merchantId: merchant.id,
      });

      // Add the new color to selected colors
      setSelectedColors([...selectedColors, addedColor.id]);

      // Reset form
      setNewColor({ name: "", value: "#000000" });
      setIsAddingColor(false);
    } catch (error) {
      setColorError(
        error instanceof Error ? error.message : "Failed to add color"
      );
    }
  };

  const generateVariants = () => {
    const variants: Variant[] = [];

    if (selectedColors.length === 0 && selectedSizes.length === 0) {
      return;
    }

    // If only colors are selected
    if (selectedColors.length > 0 && selectedSizes.length === 0) {
      selectedColors.forEach((colorId) => {
        variants.push({ colorId, price: basePrice });
      });
    }
    // If only sizes are selected
    else if (selectedColors.length === 0 && selectedSizes.length > 0) {
      selectedSizes.forEach((sizeId) => {
        variants.push({ sizeId, price: basePrice });
      });
    }
    // If both colors and sizes are selected
    else {
      selectedColors.forEach((colorId) => {
        selectedSizes.forEach((sizeId) => {
          variants.push({ colorId, sizeId, price: basePrice });
        });
      });
    }

    onChange(variants);
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    newValue: string | number
  ) => {
    const updatedVariants = value.map((variant, i) =>
      i === index ? { ...variant, [field]: newValue } : variant
    );
    onChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = value.filter((_, i) => i !== index);
    onChange(updatedVariants);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Product Variants</h3>
          <p className="text-sm text-gray-500">
            Configure your product variants
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Colors</label>
            <div className="flex gap-2">
              <Select
                onValueChange={(colorId) => {
                  if (!selectedColors.includes(colorId)) {
                    setSelectedColors([...selectedColors, colorId]);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select colors" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isAddingColor} onOpenChange={setIsAddingColor}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Color</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="colorName">Color Name</Label>
                      <Input
                        id="colorName"
                        value={newColor.name}
                        onChange={(e) =>
                          setNewColor({ ...newColor, name: e.target.value })
                        }
                        placeholder="e.g., Navy Blue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="colorValue">Color Value</Label>
                      <div className="flex gap-2">
                        <Input
                          id="colorValue"
                          value={newColor.value}
                          onChange={(e) =>
                            setNewColor({ ...newColor, value: e.target.value })
                          }
                          placeholder="#000000"
                        />
                        <input
                          type="color"
                          value={newColor.value}
                          onChange={(e) =>
                            setNewColor({ ...newColor, value: e.target.value })
                          }
                          className="w-12 h-10"
                        />
                      </div>
                    </div>
                    {colorError && (
                      <p className="text-sm text-red-500">{colorError}</p>
                    )}
                    <Button
                      onClick={handleAddColor}
                      className="w-full"
                      type="button"
                    >
                      Add Color
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium">Sizes</label>
            <div className="flex gap-2">
              <Select
                onValueChange={(sizeId) => {
                  if (!selectedSizes.includes(sizeId)) {
                    setSelectedSizes([...selectedSizes, sizeId]);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select sizes" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isAddingSize} onOpenChange={setIsAddingSize}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Size</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sizeName">Size Name</Label>
                      <Input
                        id="sizeName"
                        value={newSize.name}
                        onChange={(e) =>
                          setNewSize({ ...newSize, name: e.target.value })
                        }
                        placeholder="e.g., Small, Medium, or Large"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sizeValue">Size Value</Label>
                      <div className="flex gap-2">
                        <Input
                          id="sizeValue"
                          value={newSize.value}
                          onChange={(e) =>
                            setNewSize({ ...newSize, value: e.target.value })
                          }
                          placeholder="e,g. S, M, or L"
                        />
                      </div>
                    </div>
                    {sizeError && (
                      <p className="text-sm text-red-500">{sizeError}</p>
                    )}
                    <Button
                      onClick={handleAddSize}
                      className="w-full"
                      type="button"
                    >
                      Add Size
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {selectedColors.map((colorId) => (
            <div
              key={colorId}
              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
            >
              <div
                className="w-3 h-3 rounded-full border"
                style={{
                  backgroundColor: colors.find((c) => c.id === colorId)?.value,
                }}
              />
              {colors.find((c) => c.id === colorId)?.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedColors(
                    selectedColors.filter((id) => id !== colorId)
                  )
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {selectedSizes.map((sizeId) => (
            <div
              key={sizeId}
              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
            >
              {sizes.find((s) => s.id === sizeId)?.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedSizes(selectedSizes.filter((id) => id !== sizeId))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={generateVariants}
          disabled={selectedColors.length === 0 && selectedSizes.length === 0}
        >
          Generate Variants
        </Button>
      </div>

      {value.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              {selectedColors.length > 0 && <TableHead>Color</TableHead>}
              {selectedSizes.length > 0 && <TableHead>Size</TableHead>}
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              {trackQuantity && <TableHead>Stock</TableHead>}
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value.map((variant, index) => (
              <TableRow key={index}>
                {selectedColors.length > 0 && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{
                          backgroundColor: colors.find(
                            (c) => c.id === variant.colorId
                          )?.value,
                        }}
                      />
                      {colors.find((c) => c.id === variant.colorId)?.name}
                    </div>
                  </TableCell>
                )}
                {selectedSizes.length > 0 && (
                  <TableCell>
                    {sizes.find((s) => s.id === variant.sizeId)?.name}
                  </TableCell>
                )}
                <TableCell>
                  <Input
                    value={variant.sku || ""}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    placeholder="SKU"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={variant.price || basePrice}
                    onChange={(e) =>
                      updateVariant(index, "price", Number(e.target.value))
                    }
                    placeholder="Price"
                  />
                </TableCell>
                {trackQuantity && (
                  <TableCell>
                    <Input
                      type="number"
                      value={variant.inStock || 0}
                      onChange={(e) =>
                        updateVariant(index, "inStock", Number(e.target.value))
                      }
                      placeholder="Stock"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ProductVariants;
