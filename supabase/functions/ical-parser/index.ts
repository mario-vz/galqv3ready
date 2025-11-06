import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import ical from "npm:node-ical@0.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ICalUrl {
  url: string;
  source: string;
}

interface Reservation {
  start: string;
  end: string;
  title: string;
  source: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { urls }: { urls: ICalUrl[] } = await req.json();

    if (!urls || !Array.isArray(urls)) {
      return new Response(
        JSON.stringify({ error: "Invalid request. Expected { urls: [{url: string, source: string}] }" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const allReservations: Reservation[] = [];

    for (const { url, source } of urls) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch ${source}: ${response.statusText}`);
          continue;
        }

        const icalData = await response.text();
        const events = ical.parseICS(icalData);

        for (const event of Object.values(events)) {
          if (event.type === "VEVENT" && event.start && event.end) {
            allReservations.push({
              start: new Date(event.start).toISOString(),
              end: new Date(event.end).toISOString(),
              title: event.summary || `Reserva ${source}`,
              source: source,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing ${source}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ reservations: allReservations }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
