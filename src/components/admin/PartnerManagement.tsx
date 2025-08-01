// src/components/admin/PartnerManagement.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase'; // Using client-side db instance
import { collection, getDocs } from 'firebase/firestore';

interface DataItem {
    id: string;
    Name?: string;
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
        const dataCollection = collection(db, 'data');
        const dataSnapshot = await getDocs(dataCollection);
        
        if (dataSnapshot.empty) {
            console.log("No documents found in 'data' collection.");
        }

        const fetchedData = dataSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DataItem));
        
        setData(fetchedData);

        toast({
          title: "Success",
          description: `Successfully fetched ${fetchedData.length} documents from the 'data' collection.`,
        });

      } catch (error) {
        console.error("Failed to fetch data from client:", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not fetch data from Firestore. Check console for details and verify your Firestore security rules.",
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
          <p className="mb-4">This component now fetches all documents from the 'data' collection using the client-side SDK to verify the database connection.</p>
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
                      return <span key={key}>, <strong>{key}:</strong> {item[key]}</span>
                    }
                    return null;
                  })}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No documents found in the 'data' collection. This could be due to Firestore security rules or an empty collection.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
