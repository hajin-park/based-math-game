import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { GraduationCap, Binary, Hexagon, Grid3x3, Zap } from "lucide-react";

export default function Tutorials() {
  const [binaryInput, setBinaryInput] = useState("1010");
  const [octalInput, setOctalInput] = useState("755");
  const [decimalInput, setDecimalInput] = useState("42");
  const [hexInput, setHexInput] = useState("2A");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-12 text-center space-y-4 animate-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="h-10 w-10 text-primary" />
          <h1 className="text-5xl font-bold gradient-text">
            Base Conversion Tutorials
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Learn how to count and convert between different number systems
        </p>
      </div>

      <Tabs defaultValue="binary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          <TabsTrigger value="binary" className="flex items-center gap-2 py-3">
            <Binary className="h-4 w-4" />
            <span className="hidden sm:inline">Binary</span>
          </TabsTrigger>
          <TabsTrigger value="octal" className="flex items-center gap-2 py-3">
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Octal</span>
          </TabsTrigger>
          <TabsTrigger value="decimal" className="flex items-center gap-2 py-3">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Decimal</span>
          </TabsTrigger>
          <TabsTrigger value="hex" className="flex items-center gap-2 py-3">
            <Hexagon className="h-4 w-4" />
            <span className="hidden sm:inline">Hex</span>
          </TabsTrigger>
        </TabsList>

        {/* Binary Tab */}
        <TabsContent value="binary" className="space-y-6 animate-in">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Binary className="h-6 w-6 text-info" />
                Binary (Base 2)
              </CardTitle>
              <CardDescription>
                Uses digits 0-1 • The language of computers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* How It Works */}
              <div>
                <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each position represents a power of 2. Multiply each digit by
                  its place value and sum them.
                </p>
                <div className="bg-info/10 p-4 rounded-lg border border-info/30">
                  <p className="text-sm font-mono mb-2">
                    <strong>Example:</strong> 1011₂ = (1×8) + (0×4) + (1×2) +
                    (1×1) = <strong className="text-info">11₁₀</strong>
                  </p>
                </div>
              </div>

              {/* Counting */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Counting in Binary
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {Array.from({ length: 16 }, (_, i) => ({
                    dec: i,
                    bin: i.toString(2).padStart(4, "0"),
                  })).map(({ dec, bin }) => (
                    <div
                      key={dec}
                      className="bg-info/10 p-2 rounded text-center border border-info/20"
                    >
                      <div className="font-mono text-sm font-bold text-info">
                        {bin}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        = {dec}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Converter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Try It Yourself</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Binary Input:
                    </label>
                    <Input
                      value={binaryInput}
                      onChange={(e) =>
                        setBinaryInput(e.target.value.replace(/[^01]/g, ""))
                      }
                      placeholder="Enter binary (e.g., 1010)"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Octal</p>
                      <p className="font-mono text-lg font-bold">
                        {binaryInput
                          ? parseInt(binaryInput, 2).toString(8)
                          : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Decimal</p>
                      <p className="font-mono text-lg font-bold">
                        {binaryInput ? parseInt(binaryInput, 2) : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Hexadecimal</p>
                      <p className="font-mono text-lg font-bold">
                        {binaryInput
                          ? parseInt(binaryInput, 2).toString(16).toUpperCase()
                          : "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Octal Tab */}
        <TabsContent value="octal" className="space-y-6 animate-in">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Grid3x3 className="h-6 w-6 text-warning" />
                Octal (Base 8)
              </CardTitle>
              <CardDescription>
                Uses digits 0-7 • Common in Unix file permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* How It Works */}
              <div>
                <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each position represents a power of 8. Each octal digit equals
                  exactly 3 binary digits.
                </p>
                <div className="bg-warning/10 p-4 rounded-lg border border-warning/30">
                  <p className="text-sm font-mono mb-2">
                    <strong>Example:</strong> 17₈ = (1×8) + (7×1) ={" "}
                    <strong className="text-warning">15₁₀</strong>
                  </p>
                </div>
              </div>

              {/* Counting */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Counting in Octal
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {Array.from({ length: 16 }, (_, i) => ({
                    dec: i,
                    oct: i.toString(8),
                  })).map(({ dec, oct }) => (
                    <div
                      key={dec}
                      className="bg-warning/10 p-2 rounded text-center border border-warning/20"
                    >
                      <div className="font-mono text-sm font-bold text-warning">
                        {oct}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        = {dec}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Converter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Try It Yourself</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Octal Input:
                    </label>
                    <Input
                      value={octalInput}
                      onChange={(e) =>
                        setOctalInput(e.target.value.replace(/[^0-7]/g, ""))
                      }
                      placeholder="Enter octal (e.g., 755)"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Binary</p>
                      <p className="font-mono text-lg font-bold break-all">
                        {octalInput ? parseInt(octalInput, 8).toString(2) : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Decimal</p>
                      <p className="font-mono text-lg font-bold">
                        {octalInput ? parseInt(octalInput, 8) : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Hexadecimal</p>
                      <p className="font-mono text-lg font-bold">
                        {octalInput
                          ? parseInt(octalInput, 8).toString(16).toUpperCase()
                          : "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decimal Tab */}
        <TabsContent value="decimal" className="space-y-6 animate-in">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-success" />
                Decimal (Base 10)
              </CardTitle>
              <CardDescription>
                Uses digits 0-9 • The number system we use every day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* How It Works */}
              <div>
                <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each position represents a power of 10. This is the standard
                  number system used in everyday life.
                </p>
                <div className="bg-success/10 p-4 rounded-lg border border-success/30">
                  <p className="text-sm font-mono mb-2">
                    <strong>Example:</strong> 123₁₀ = (1×100) + (2×10) + (3×1) ={" "}
                    <strong className="text-success">123₁₀</strong>
                  </p>
                </div>
              </div>

              {/* Counting */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Counting in Decimal
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {Array.from({ length: 20 }, (_, i) => i).map((num) => (
                    <div
                      key={num}
                      className="bg-success/10 p-2 rounded text-center border border-success/20"
                    >
                      <div className="font-mono text-sm font-bold text-success">
                        {num}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Converter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Try It Yourself</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Decimal Input:
                    </label>
                    <Input
                      value={decimalInput}
                      onChange={(e) =>
                        setDecimalInput(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      placeholder="Enter decimal (e.g., 42)"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Binary</p>
                      <p className="font-mono text-lg font-bold break-all">
                        {decimalInput
                          ? parseInt(decimalInput).toString(2)
                          : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Octal</p>
                      <p className="font-mono text-lg font-bold">
                        {decimalInput
                          ? parseInt(decimalInput).toString(8)
                          : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Hexadecimal</p>
                      <p className="font-mono text-lg font-bold">
                        {decimalInput
                          ? parseInt(decimalInput).toString(16).toUpperCase()
                          : "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hexadecimal Tab */}
        <TabsContent value="hex" className="space-y-6 animate-in">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Hexagon className="h-6 w-6 text-primary" />
                Hexadecimal (Base 16)
              </CardTitle>
              <CardDescription>
                Uses digits 0-9, A-F • Common in web colors and memory addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* How It Works */}
              <div>
                <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each position represents a power of 16. Letters A-F represent
                  values 10-15. Each hex digit equals exactly 4 binary digits.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                  <p className="text-sm font-mono mb-2">
                    <strong>Example:</strong> 2F₁₆ = (2×16) + (15×1) ={" "}
                    <strong className="text-primary">47₁₀</strong>
                  </p>
                </div>
              </div>

              {/* Counting */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Counting in Hexadecimal
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {Array.from({ length: 16 }, (_, i) => ({
                    dec: i,
                    hex: i.toString(16).toUpperCase(),
                  })).map(({ dec, hex }) => (
                    <div
                      key={dec}
                      className="bg-primary/10 p-2 rounded text-center border border-primary/20"
                    >
                      <div className="font-mono text-sm font-bold text-primary">
                        {hex}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        = {dec}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Converter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Try It Yourself</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Hexadecimal Input:
                    </label>
                    <Input
                      value={hexInput}
                      onChange={(e) =>
                        setHexInput(
                          e.target.value
                            .replace(/[^0-9A-Fa-f]/g, "")
                            .toUpperCase(),
                        )
                      }
                      placeholder="Enter hex (e.g., 2A or FF)"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Binary</p>
                      <p className="font-mono text-lg font-bold break-all">
                        {hexInput ? parseInt(hexInput, 16).toString(2) : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Octal</p>
                      <p className="font-mono text-lg font-bold">
                        {hexInput ? parseInt(hexInput, 16).toString(8) : "0"}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Decimal</p>
                      <p className="font-mono text-lg font-bold">
                        {hexInput ? parseInt(hexInput, 16) : "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
