// src/components/admin/PartnerManagement.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getData } from '@/app/admin/actions';

interface DataItem {
    id: string;
    [key: string]: any;
}

export default function PartnerManagement() {
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getData();

        if (result.error) {
          throw new Error(result.error);
        }

        setData(result.data || []);

        toast({
          title: "Success",
          description: `Successfully fetched ${result.data?.length || 0} documents from the 'data' collection.`,
        });

      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message || "Could not fetch data from Firestore.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  return (
    <div className="h-full flex flex-col p-6">
      <Card>
        <CardHeader>
          <CardTitle>Firestore `data` Collection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This component fetches all documents from the 'data' collection using a Next.js Server Action with the Admin SDK to verify the database connection.</p>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          ) : data.length > 0 ? (
            <ul>
              {data.map(item => (
                <li key={item.id} className="p-2 border-b">
                  <strong>ID:</strong> {item.id}
                  {Object.keys(item).map(key => {
                    if(key !== 'id') {
                      return <span key={key}>, <strong>{key}:</strong> {JSON.stringify(item[key])}</span>
                    }
                    return null;
                  })}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No documents found in the 'data' collection or the collection is empty.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
