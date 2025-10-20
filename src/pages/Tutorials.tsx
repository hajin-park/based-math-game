import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Tutorials() {
  const [binaryInput, setBinaryInput] = useState('1010');
  const [decimalInput, setDecimalInput] = useState('42');
  const [hexInput, setHexInput] = useState('2A');

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Base Conversion Tutorials</h1>
        <p className="text-muted-foreground">
          Learn how to count and convert between different number systems
        </p>
      </div>

      <Tabs defaultValue="intro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="intro">Introduction</TabsTrigger>
          <TabsTrigger value="binary">Binary (Base 2)</TabsTrigger>
          <TabsTrigger value="octal">Octal (Base 8)</TabsTrigger>
          <TabsTrigger value="hex">Hexadecimal (Base 16)</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        {/* Introduction Tab */}
        <TabsContent value="intro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What are Number Bases?</CardTitle>
              <CardDescription>Understanding different number systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A <strong>number base</strong> (or radix) is the number of unique digits used to represent numbers in a positional numeral system.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Decimal (Base 10)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">The system we use every day</p>
                    <Badge variant="outline" className="mr-2">Digits: 0-9</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: 123 = (1×10²) + (2×10¹) + (3×10⁰)
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Binary (Base 2)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Used by computers</p>
                    <Badge variant="outline" className="mr-2">Digits: 0-1</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: 1011 = (1×2³) + (0×2²) + (1×2¹) + (1×2⁰) = 11
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Octal (Base 8)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Used in Unix permissions</p>
                    <Badge variant="outline" className="mr-2">Digits: 0-7</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: 17 = (1×8¹) + (7×8⁰) = 15
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Hexadecimal (Base 16)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Used for colors and memory addresses</p>
                    <Badge variant="outline" className="mr-2">Digits: 0-9, A-F</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: 2F = (2×16¹) + (15×16⁰) = 47
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">💡 Key Concept: Positional Notation</h3>
                <p className="text-sm">
                  In any base system, each digit's position represents a power of the base.
                  The rightmost digit is the base to the power of 0, the next is base¹, then base², and so on.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Binary Tab */}
        <TabsContent value="binary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Binary (Base 2) - The Language of Computers</CardTitle>
              <CardDescription>Understanding ones and zeros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Introduction */}
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed">
                  Binary is the fundamental language of computers. Every piece of data in a computer—from text and images to videos and programs—is ultimately stored as a sequence of 1s and 0s. Understanding binary is essential for anyone interested in computer science, programming, or digital electronics.
                </p>
                <p className="text-base leading-relaxed mt-3">
                  In binary (base 2), we only use two digits: <strong>0</strong> and <strong>1</strong>. Each position in a binary number represents a power of 2, just like each position in decimal represents a power of 10.
                </p>
              </div>

              {/* How Binary Works */}
              <div>
                <h3 className="text-xl font-bold mb-4">How Binary Works</h3>
                <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4 text-lg">Place Values (Powers of 2)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-blue-300 dark:border-blue-700">
                          <th className="p-3 text-left bg-blue-100 dark:bg-blue-900">Index</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">7</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">6</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">5</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">4</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">3</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">2</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">1</th>
                          <th className="p-3 text-center bg-blue-100 dark:bg-blue-900">0</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-blue-200 dark:border-blue-800">
                          <td className="p-3 font-semibold bg-blue-50 dark:bg-blue-900/50">Power</td>
                          <td className="p-3 text-center font-mono">2⁷</td>
                          <td className="p-3 text-center font-mono">2⁶</td>
                          <td className="p-3 text-center font-mono">2⁵</td>
                          <td className="p-3 text-center font-mono">2⁴</td>
                          <td className="p-3 text-center font-mono">2³</td>
                          <td className="p-3 text-center font-mono">2²</td>
                          <td className="p-3 text-center font-mono">2¹</td>
                          <td className="p-3 text-center font-mono">2⁰</td>
                        </tr>
                        <tr className="border-b border-blue-200 dark:border-blue-800">
                          <td className="p-3 font-semibold bg-blue-50 dark:bg-blue-900/50">Value</td>
                          <td className="p-3 text-center font-bold">128</td>
                          <td className="p-3 text-center font-bold">64</td>
                          <td className="p-3 text-center font-bold">32</td>
                          <td className="p-3 text-center font-bold">16</td>
                          <td className="p-3 text-center font-bold">8</td>
                          <td className="p-3 text-center font-bold">4</td>
                          <td className="p-3 text-center font-bold">2</td>
                          <td className="p-3 text-center font-bold">1</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold bg-blue-50 dark:bg-blue-900/50">Example</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">1</td>
                          <td className="p-3 text-center font-mono text-lg">0</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">1</td>
                          <td className="p-3 text-center font-mono text-lg">0</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">1</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">1</td>
                          <td className="p-3 text-center font-mono text-lg">0</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-white dark:bg-blue-900 rounded border-2 border-blue-300 dark:border-blue-700">
                    <p className="text-sm font-mono mb-2">
                      <strong>Calculation:</strong> 10101101₂
                    </p>
                    <p className="text-sm font-mono mb-2">
                      = (1×128) + (0×64) + (1×32) + (0×16) + (1×8) + (1×4) + (0×2) + (1×1)
                    </p>
                    <p className="text-sm font-mono mb-2">
                      = 128 + 0 + 32 + 0 + 8 + 4 + 0 + 1
                    </p>
                    <p className="text-base font-mono font-bold text-blue-600 dark:text-blue-400">
                      = 173₁₀
                    </p>
                  </div>
                </div>
              </div>

              {/* Counting in Binary */}
              <div>
                <h3 className="text-xl font-bold mb-4">Counting in Binary</h3>
                <p className="text-base leading-relaxed mb-4">
                  Just like in decimal where we count 0, 1, 2... 9, then carry over to get 10, in binary we count 0, 1, then carry over to get 10 (which equals 2 in decimal). Here's how counting works:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { dec: 0, bin: '0000' },
                    { dec: 1, bin: '0001' },
                    { dec: 2, bin: '0010' },
                    { dec: 3, bin: '0011' },
                    { dec: 4, bin: '0100' },
                    { dec: 5, bin: '0101' },
                    { dec: 6, bin: '0110' },
                    { dec: 7, bin: '0111' },
                    { dec: 8, bin: '1000' },
                    { dec: 9, bin: '1001' },
                    { dec: 10, bin: '1010' },
                    { dec: 11, bin: '1011' },
                    { dec: 12, bin: '1100' },
                    { dec: 13, bin: '1101' },
                    { dec: 14, bin: '1110' },
                    { dec: 15, bin: '1111' },
                  ].map(({ dec, bin }) => (
                    <div key={dec} className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800 text-center hover:shadow-md transition-shadow">
                      <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{bin}</div>
                      <div className="text-sm text-muted-foreground mt-1">= {dec}₁₀</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-World Applications */}
              <div>
                <h3 className="text-xl font-bold mb-4">Real-World Applications</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">💻 Computer Memory</h4>
                    <p className="text-sm">All data in computer memory is stored as binary. A single binary digit is called a "bit," and 8 bits make a "byte."</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🔌 Digital Circuits</h4>
                    <p className="text-sm">Electronic circuits use binary: voltage present (1) or absent (0) to represent data and perform calculations.</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🌐 Network Protocols</h4>
                    <p className="text-sm">IP addresses, subnet masks, and network data are all fundamentally binary representations.</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🎮 Game Development</h4>
                    <p className="text-sm">Binary operations (AND, OR, XOR) are used for efficient flag management and bit manipulation.</p>
                  </div>
                </div>
              </div>

              {/* Interactive Converter */}
              <div>
                <h3 className="text-xl font-bold mb-4">Interactive Converter</h3>
                <p className="text-base leading-relaxed mb-4">
                  Try converting binary numbers yourself! Enter any binary number below to see its equivalent in other bases.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Binary Input (only 0s and 1s):</label>
                    <Input
                      value={binaryInput}
                      onChange={(e) => setBinaryInput(e.target.value.replace(/[^01]/g, ''))}
                      placeholder="Enter binary (e.g., 1010)"
                      className="font-mono text-lg"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <p className="text-sm font-semibold mb-1 text-green-700 dark:text-green-400">Decimal</p>
                      <p className="font-mono text-2xl font-bold">
                        {binaryInput ? parseInt(binaryInput, 2) : 0}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-700">
                      <p className="text-sm font-semibold mb-1 text-orange-700 dark:text-orange-400">Octal</p>
                      <p className="font-mono text-2xl font-bold">
                        {binaryInput ? parseInt(binaryInput, 2).toString(8) : 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                      <p className="text-sm font-semibold mb-1 text-purple-700 dark:text-purple-400">Hexadecimal</p>
                      <p className="font-mono text-2xl font-bold">
                        {binaryInput ? parseInt(binaryInput, 2).toString(16).toUpperCase() : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Octal Tab */}
        <TabsContent value="octal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Octal (Base 8) - Groups of Three</CardTitle>
              <CardDescription>Understanding base 8 number system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Introduction */}
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed">
                  Octal (base 8) is a number system that uses eight digits: <strong>0, 1, 2, 3, 4, 5, 6, 7</strong>. While less common than binary or hexadecimal in modern computing, octal has historical significance and is still used in specific applications, particularly in Unix/Linux file permissions.
                </p>
                <p className="text-base leading-relaxed mt-3">
                  One of the key advantages of octal is its natural relationship with binary: each octal digit corresponds exactly to three binary digits (bits). This makes conversion between binary and octal straightforward and efficient.
                </p>
              </div>

              {/* How Octal Works */}
              <div>
                <h3 className="text-xl font-bold mb-4">How Octal Works</h3>
                <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4 text-lg">Place Values (Powers of 8)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-orange-300 dark:border-orange-700">
                          <th className="p-3 text-left bg-orange-100 dark:bg-orange-900">Index</th>
                          <th className="p-3 text-center bg-orange-100 dark:bg-orange-900">5</th>
                          <th className="p-3 text-center bg-orange-100 dark:bg-orange-900">4</th>
                          <th className="p-3 text-center bg-orange-100 dark:bg-orange-900">3</th>
                          <th className="p-3 text-center bg-orange-100 dark:bg-orange-900">2</th>
                          <th className="p-3 text-center bg-orange-100 dark:bg-orange-900">1</th>
                          <th className="p-3 text-center bg-orange-100 dark:bg-orange-900">0</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-orange-200 dark:border-orange-800">
                          <td className="p-3 font-semibold bg-orange-50 dark:bg-orange-900/50">Power</td>
                          <td className="p-3 text-center font-mono">8⁵</td>
                          <td className="p-3 text-center font-mono">8⁴</td>
                          <td className="p-3 text-center font-mono">8³</td>
                          <td className="p-3 text-center font-mono">8²</td>
                          <td className="p-3 text-center font-mono">8¹</td>
                          <td className="p-3 text-center font-mono">8⁰</td>
                        </tr>
                        <tr className="border-b border-orange-200 dark:border-orange-800">
                          <td className="p-3 font-semibold bg-orange-50 dark:bg-orange-900/50">Value</td>
                          <td className="p-3 text-center font-bold">32768</td>
                          <td className="p-3 text-center font-bold">4096</td>
                          <td className="p-3 text-center font-bold">512</td>
                          <td className="p-3 text-center font-bold">64</td>
                          <td className="p-3 text-center font-bold">8</td>
                          <td className="p-3 text-center font-bold">1</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold bg-orange-50 dark:bg-orange-900/50">Example</td>
                          <td className="p-3 text-center font-mono text-lg">0</td>
                          <td className="p-3 text-center font-mono text-lg">0</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">7</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">5</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">4</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">3</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-white dark:bg-orange-900 rounded border-2 border-orange-300 dark:border-orange-700">
                    <p className="text-sm font-mono mb-2">
                      <strong>Calculation:</strong> 7543₈
                    </p>
                    <p className="text-sm font-mono mb-2">
                      = (7×512) + (5×64) + (4×8) + (3×1)
                    </p>
                    <p className="text-sm font-mono mb-2">
                      = 3584 + 320 + 32 + 3
                    </p>
                    <p className="text-base font-mono font-bold text-orange-600 dark:text-orange-400">
                      = 3939₁₀
                    </p>
                  </div>
                </div>
              </div>

              {/* Counting in Octal */}
              <div>
                <h3 className="text-xl font-bold mb-4">Counting in Octal</h3>
                <p className="text-base leading-relaxed mb-4">
                  In octal, after reaching 7, we carry over to the next position. So after 7 comes 10 (which equals 8 in decimal), then 11, 12... up to 17, then 20 (which equals 16 in decimal), and so on.
                </p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {Array.from({ length: 24 }, (_, i) => ({
                    dec: i,
                    oct: i.toString(8),
                  })).map(({ dec, oct }) => (
                    <div key={dec} className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800 text-center hover:shadow-md transition-shadow">
                      <div className="font-mono text-lg font-bold text-orange-600 dark:text-orange-400">{oct}</div>
                      <div className="text-sm text-muted-foreground mt-1">= {dec}₁₀</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Binary to Octal Conversion */}
              <div>
                <h3 className="text-xl font-bold mb-4">Binary ↔ Octal Conversion</h3>
                <p className="text-base leading-relaxed mb-4">
                  Converting between binary and octal is simple because 8 = 2³. Each octal digit represents exactly 3 binary digits.
                </p>
                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold mb-3 text-lg">Step-by-Step Example</h4>
                  <div className="bg-background p-4 rounded border-2 border-orange-300 dark:border-orange-700">
                    <p className="text-sm mb-3 font-semibold">Convert binary 101110011₂ to octal:</p>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Step 1:</span>
                        <span>Group from right: <span className="text-blue-600 dark:text-blue-400">101</span> <span className="text-green-600 dark:text-green-400">110</span> <span className="text-purple-600 dark:text-purple-400">011</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Step 2:</span>
                        <span>Convert each group:</span>
                      </div>
                      <div className="ml-8 space-y-1">
                        <div><span className="text-blue-600 dark:text-blue-400">101</span> = (1×4) + (0×2) + (1×1) = <strong className="text-blue-600 dark:text-blue-400">5</strong></div>
                        <div><span className="text-green-600 dark:text-green-400">110</span> = (1×4) + (1×2) + (0×1) = <strong className="text-green-600 dark:text-green-400">6</strong></div>
                        <div><span className="text-purple-600 dark:text-purple-400">011</span> = (0×4) + (1×2) + (1×1) = <strong className="text-purple-600 dark:text-purple-400">3</strong></div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="text-muted-foreground">Result:</span>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">563₈</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-World Applications */}
              <div>
                <h3 className="text-xl font-bold mb-4">Real-World Applications</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🔐 Unix File Permissions</h4>
                    <p className="text-sm mb-2">The most common use of octal today. Each digit represents read (4), write (2), and execute (1) permissions.</p>
                    <div className="font-mono text-xs bg-background p-2 rounded mt-2">
                      chmod 755 = rwxr-xr-x<br/>
                      7 (owner) = 4+2+1 = rwx<br/>
                      5 (group) = 4+0+1 = r-x<br/>
                      5 (others) = 4+0+1 = r-x
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">⚡ Digital Electronics</h4>
                    <p className="text-sm">Octal is useful for representing groups of 3 bits in circuit design and debugging.</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🖥️ Legacy Computing</h4>
                    <p className="text-sm">Older computer systems (like PDP-8) used octal as their primary number system for programming.</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📝 Escape Sequences</h4>
                    <p className="text-sm">Some programming languages use octal for character escape sequences (e.g., \101 for 'A').</p>
                  </div>
                </div>
              </div>

              {/* Interactive Converter */}
              <div>
                <h3 className="text-xl font-bold mb-4">Interactive Converter</h3>
                <p className="text-base leading-relaxed mb-4">
                  Try converting octal numbers yourself! Enter any octal number (0-7 only) below.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Octal Input (digits 0-7):</label>
                    <Input
                      value={decimalInput}
                      onChange={(e) => setDecimalInput(e.target.value.replace(/[^0-7]/g, ''))}
                      placeholder="Enter octal (e.g., 755)"
                      className="font-mono text-lg"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <p className="text-sm font-semibold mb-1 text-green-700 dark:text-green-400">Decimal</p>
                      <p className="font-mono text-2xl font-bold">
                        {decimalInput ? parseInt(decimalInput, 8) : 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                      <p className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-400">Binary</p>
                      <p className="font-mono text-2xl font-bold break-all">
                        {decimalInput ? parseInt(decimalInput, 8).toString(2) : 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                      <p className="text-sm font-semibold mb-1 text-purple-700 dark:text-purple-400">Hexadecimal</p>
                      <p className="font-mono text-2xl font-bold">
                        {decimalInput ? parseInt(decimalInput, 8).toString(16).toUpperCase() : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hexadecimal Tab */}
        <TabsContent value="hex" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hexadecimal (Base 16) - The Programmer's Choice</CardTitle>
              <CardDescription>Understanding base 16 with letters A-F</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Introduction */}
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed">
                  Hexadecimal (often shortened to "hex") is a base-16 number system that uses sixteen distinct symbols: <strong>0-9</strong> for values zero through nine, and <strong>A-F</strong> for values ten through fifteen. It's the most widely used number system in modern computing after decimal and binary.
                </p>
                <p className="text-base leading-relaxed mt-3">
                  Hexadecimal is popular because it provides a human-friendly representation of binary data. Each hex digit represents exactly four binary digits (bits), making it much more compact and readable than binary while maintaining a direct relationship with how computers store data.
                </p>
              </div>

              {/* Hexadecimal Digits */}
              <div>
                <h3 className="text-xl font-bold mb-4">The 16 Hexadecimal Digits</h3>
                <p className="text-base leading-relaxed mb-4">
                  In hexadecimal, we use letters A through F to represent values 10 through 15. This allows us to represent any value from 0 to 15 with a single digit.
                </p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {Array.from({ length: 16 }, (_, i) => ({
                    dec: i,
                    hex: i.toString(16).toUpperCase(),
                  })).map(({ dec, hex }) => (
                    <div key={dec} className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800 text-center hover:shadow-md transition-shadow">
                      <div className="font-mono text-2xl font-bold text-purple-600 dark:text-purple-400">{hex}</div>
                      <div className="text-sm text-muted-foreground mt-1">= {dec}₁₀</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How Hexadecimal Works */}
              <div>
                <h3 className="text-xl font-bold mb-4">How Hexadecimal Works</h3>
                <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4 text-lg">Place Values (Powers of 16)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-purple-300 dark:border-purple-700">
                          <th className="p-3 text-left bg-purple-100 dark:bg-purple-900">Index</th>
                          <th className="p-3 text-center bg-purple-100 dark:bg-purple-900">4</th>
                          <th className="p-3 text-center bg-purple-100 dark:bg-purple-900">3</th>
                          <th className="p-3 text-center bg-purple-100 dark:bg-purple-900">2</th>
                          <th className="p-3 text-center bg-purple-100 dark:bg-purple-900">1</th>
                          <th className="p-3 text-center bg-purple-100 dark:bg-purple-900">0</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-purple-200 dark:border-purple-800">
                          <td className="p-3 font-semibold bg-purple-50 dark:bg-purple-900/50">Power</td>
                          <td className="p-3 text-center font-mono">16⁴</td>
                          <td className="p-3 text-center font-mono">16³</td>
                          <td className="p-3 text-center font-mono">16²</td>
                          <td className="p-3 text-center font-mono">16¹</td>
                          <td className="p-3 text-center font-mono">16⁰</td>
                        </tr>
                        <tr className="border-b border-purple-200 dark:border-purple-800">
                          <td className="p-3 font-semibold bg-purple-50 dark:bg-purple-900/50">Value</td>
                          <td className="p-3 text-center font-bold">65536</td>
                          <td className="p-3 text-center font-bold">4096</td>
                          <td className="p-3 text-center font-bold">256</td>
                          <td className="p-3 text-center font-bold">16</td>
                          <td className="p-3 text-center font-bold">1</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold bg-purple-50 dark:bg-purple-900/50">Example</td>
                          <td className="p-3 text-center font-mono text-lg">0</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">1</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">A</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">F</td>
                          <td className="p-3 text-center font-mono text-lg bg-green-100 dark:bg-green-900">C</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-white dark:bg-purple-900 rounded border-2 border-purple-300 dark:border-purple-700">
                    <p className="text-sm font-mono mb-2">
                      <strong>Calculation:</strong> 1AFC₁₆
                    </p>
                    <p className="text-sm font-mono mb-2">
                      = (1×4096) + (A×256) + (F×16) + (C×1)
                    </p>
                    <p className="text-sm font-mono mb-2">
                      = (1×4096) + (10×256) + (15×16) + (12×1)
                    </p>
                    <p className="text-sm font-mono mb-2">
                      = 4096 + 2560 + 240 + 12
                    </p>
                    <p className="text-base font-mono font-bold text-purple-600 dark:text-purple-400">
                      = 6908₁₀
                    </p>
                  </div>
                </div>
              </div>

              {/* Binary to Hex Conversion */}
              <div>
                <h3 className="text-xl font-bold mb-4">Binary ↔ Hexadecimal Conversion</h3>
                <p className="text-base leading-relaxed mb-4">
                  Converting between binary and hexadecimal is straightforward because 16 = 2⁴. Each hexadecimal digit represents exactly 4 binary digits.
                </p>
                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold mb-3 text-lg">Step-by-Step Example</h4>
                  <div className="bg-background p-4 rounded border-2 border-purple-300 dark:border-purple-700">
                    <p className="text-sm mb-3 font-semibold">Convert binary 10101111110₂ to hexadecimal:</p>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Step 1:</span>
                        <span>Group from right: <span className="text-blue-600 dark:text-blue-400">1010</span> <span className="text-green-600 dark:text-green-400">1111</span> <span className="text-purple-600 dark:text-purple-400">1100</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Step 2:</span>
                        <span>Convert each group:</span>
                      </div>
                      <div className="ml-8 space-y-1">
                        <div><span className="text-blue-600 dark:text-blue-400">1010</span> = (1×8) + (0×4) + (1×2) + (0×1) = 10 = <strong className="text-blue-600 dark:text-blue-400">A</strong></div>
                        <div><span className="text-green-600 dark:text-green-400">1111</span> = (1×8) + (1×4) + (1×2) + (1×1) = 15 = <strong className="text-green-600 dark:text-green-400">F</strong></div>
                        <div><span className="text-purple-600 dark:text-purple-400">1100</span> = (1×8) + (1×4) + (0×2) + (0×1) = 12 = <strong className="text-purple-600 dark:text-purple-400">C</strong></div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="text-muted-foreground">Result:</span>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">AFC₁₆</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Real-World Applications */}
              <div>
                <h3 className="text-xl font-bold mb-4">Real-World Applications</h3>

                <div className="space-y-6">
                  {/* Colors */}
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">🎨 Web Colors</h4>
                    <p className="text-base leading-relaxed mb-4">
                      Hexadecimal is the standard way to represent colors on the web. Each color is represented by 6 hex digits: 2 for red, 2 for green, and 2 for blue (RGB).
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { color: '#FF0000', name: 'Red', hex: 'FF0000', rgb: 'R:255 G:0 B:0' },
                        { color: '#00FF00', name: 'Green', hex: '00FF00', rgb: 'R:0 G:255 B:0' },
                        { color: '#0000FF', name: 'Blue', hex: '0000FF', rgb: 'R:0 G:0 B:255' },
                        { color: '#FFFF00', name: 'Yellow', hex: 'FFFF00', rgb: 'R:255 G:255 B:0' },
                        { color: '#FF00FF', name: 'Magenta', hex: 'FF00FF', rgb: 'R:255 G:0 B:255' },
                        { color: '#00FFFF', name: 'Cyan', hex: '00FFFF', rgb: 'R:0 G:255 B:255' },
                      ].map(({ color, name, hex, rgb }) => (
                        <div key={hex} className="bg-muted p-3 rounded-lg border border-border hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-12 h-12 rounded border-2 border-border shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                            <div>
                              <div className="font-semibold">{name}</div>
                              <div className="font-mono text-sm">#{hex}</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{rgb}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Other Applications */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">💾 Memory Addresses</h4>
                      <p className="text-sm mb-2">Computer memory addresses are typically displayed in hexadecimal for readability.</p>
                      <div className="font-mono text-xs bg-background p-2 rounded mt-2">
                        0x7FFFFFFF<br/>
                        0x00400000<br/>
                        0xDEADBEEF
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🌐 MAC Addresses</h4>
                      <p className="text-sm mb-2">Network hardware addresses use hexadecimal notation.</p>
                      <div className="font-mono text-xs bg-background p-2 rounded mt-2">
                        00:1A:2B:3C:4D:5E<br/>
                        A4:5E:60:E8:9F:2C
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🔤 Unicode Characters</h4>
                      <p className="text-sm mb-2">Unicode code points are represented in hexadecimal.</p>
                      <div className="font-mono text-xs bg-background p-2 rounded mt-2">
                        U+1F600 = 😀<br/>
                        U+2764 = ❤<br/>
                        U+1F680 = 🚀
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">📡 IPv6 Addresses</h4>
                      <p className="text-sm mb-2">The next generation of IP addresses uses hexadecimal.</p>
                      <div className="font-mono text-xs bg-background p-2 rounded mt-2 break-all">
                        2001:0db8:85a3::8a2e:0370:7334
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Converter */}
              <div>
                <h3 className="text-xl font-bold mb-4">Interactive Converter</h3>
                <p className="text-base leading-relaxed mb-4">
                  Try converting hexadecimal numbers yourself! Enter any hex number (0-9, A-F) below.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hexadecimal Input (0-9, A-F):</label>
                    <Input
                      value={hexInput}
                      onChange={(e) => setHexInput(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
                      placeholder="Enter hex (e.g., 2A or FF)"
                      className="font-mono text-lg"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <p className="text-sm font-semibold mb-1 text-green-700 dark:text-green-400">Decimal</p>
                      <p className="font-mono text-2xl font-bold">
                        {hexInput ? parseInt(hexInput, 16) : 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                      <p className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-400">Binary</p>
                      <p className="font-mono text-xl font-bold break-all">
                        {hexInput ? parseInt(hexInput, 16).toString(2) : 0}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-700">
                      <p className="text-sm font-semibold mb-1 text-orange-700 dark:text-orange-400">Octal</p>
                      <p className="font-mono text-2xl font-bold">
                        {hexInput ? parseInt(hexInput, 16).toString(8) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Conversions</CardTitle>
              <CardDescription>Test your understanding with interactive examples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Decimal Converter</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Enter a decimal number:</label>
                    <Input
                      type="number"
                      value={decimalInput}
                      onChange={(e) => setDecimalInput(e.target.value)}
                      placeholder="Enter decimal (e.g., 42)"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Binary</h4>
                      <p className="font-mono text-lg">
                        {decimalInput ? parseInt(decimalInput).toString(2) : '0'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Base 2</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Octal</h4>
                      <p className="font-mono text-lg">
                        {decimalInput ? parseInt(decimalInput).toString(8) : '0'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Base 8</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Hexadecimal</h4>
                      <p className="font-mono text-lg">
                        {decimalInput ? parseInt(decimalInput).toString(16).toUpperCase() : '0'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Base 16</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Decimal</h4>
                      <p className="font-mono text-lg">
                        {decimalInput || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Base 10</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Conversion Cheat Sheet</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Decimal</th>
                        <th className="p-2 text-left">Binary</th>
                        <th className="p-2 text-left">Octal</th>
                        <th className="p-2 text-left">Hexadecimal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 32, 64, 128, 255].map((num) => (
                        <tr key={num} className="border-b">
                          <td className="p-2 font-mono">{num}</td>
                          <td className="p-2 font-mono">{num.toString(2)}</td>
                          <td className="p-2 font-mono">{num.toString(8)}</td>
                          <td className="p-2 font-mono">{num.toString(16).toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">🎯 Ready to Practice?</h3>
                <p className="mb-4">
                  Now that you understand the basics, try our interactive quiz modes to test your skills!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <a href="/singleplayer">Start Quiz</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/multiplayer">Play Multiplayer</a>
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">📚 Additional Resources</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted p-3 rounded">
                    <h4 className="font-medium mb-1">Conversion Tips</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>To convert from any base to decimal: multiply each digit by its place value and sum</li>
                      <li>To convert from decimal to any base: repeatedly divide by the base and track remainders</li>
                      <li>Binary ↔ Octal: group by 3 bits</li>
                      <li>Binary ↔ Hexadecimal: group by 4 bits</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-3 rounded">
                    <h4 className="font-medium mb-1">Memory Tricks</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Powers of 2: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024...</li>
                      <li>Hex letters: A=10, B=11, C=12, D=13, E=14, F=15</li>
                      <li>1 byte = 8 bits = 2 hex digits = 3 octal digits (approximately)</li>
                    </ul>
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
