
'use client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { marketItems } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { CircleDollarSign, Package, ShoppingCart } from 'lucide-react';
import type { MarketItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MarketPage() {
  const { wordCoins, buyItem, inventory } = useAppContext();
  const { toast } = useToast();

  const handleBuy = (item: MarketItem) => {
    if (wordCoins >= item.price) {
      buyItem(item);
      toast({
        title: 'Purchase Successful!',
        description: `You bought ${item.name} for ${item.price} WordCoins.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Not enough WordCoins!',
        description: `You need ${item.price - wordCoins} more coins to buy ${item.name}.`,
      });
    }
  };

  const categories = ['all', ...Array.from(new Set(marketItems.map(item => item.category)))];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Word Market</h2>
            <p className="text-muted-foreground">Spend your hard-earned WordCoins on virtual goods!</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 self-end md:self-center">
            <CircleDollarSign className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">{wordCoins}</span>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto pb-2">
            <TabsList>
              {categories.map(category => (
                 <TabsTrigger key={category} value={category} className="capitalize">{category}</TabsTrigger>
              ))}
              <TabsTrigger value="inventory"><Package className="mr-2 h-4 w-4"/>My Inventory</TabsTrigger>
            </TabsList>
        </div>
        
        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(category === 'all' ? marketItems : marketItems.filter(i => i.category === category)).map((item) => (
                <Card key={item.id} className="flex flex-col">
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <CardTitle className="font-headline">{item.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleBuy(item)} disabled={wordCoins < item.price}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Buy for {item.price}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="inventory">
            <Card>
                <CardHeader>
                    <CardTitle>Your Items</CardTitle>
                    <p className="text-muted-foreground">Items you have purchased from the market.</p>
                </CardHeader>
                <CardContent>
                    {inventory.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {inventory.map((item, index) => (
                               <div key={`${item.id}-${index}`} className="flex items-center gap-4 rounded-md border p-4">
                                   <span className="text-3xl">{item.icon}</span>
                                   <p className="font-semibold">{item.name}</p>
                               </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">Your inventory is empty. Visit the market to buy items!</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
