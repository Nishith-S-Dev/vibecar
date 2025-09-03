import { Button } from "@/components/ui/button";
import { Calendar, Car, ChevronRight, Divide, Shield } from "lucide-react";
import HomeSearch from "../components/HomeSearch"; //homeSearch
import { bodyTypes, featuredCars,faqItems } from "@/lib/data";
import CarCard from "@/components/car-card";
import Link from "next/link";
import Image from "next/image";
import { carMakes } from "@/lib/data";
import { SignedOut } from "@clerk/nextjs";
import { Accordion,AccordionItem,AccordionTrigger,AccordionContent } from "@/components/ui/accordion";
import { getFeaturedCars } from "@/actions/home";

export default async function Home() {

   const featuredCars = await getFeaturedCars()
  return (
    <div className="pt-20 flex flex-col">
      {/* {hero} */}
      <section className="relative py-20 dotted-background  ">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-7xl mb:text-8xl mb-4 gradient-title">
              {" "}
              Find your right car to Match your Vibe...
            </h1>
            <p className="text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Advanced Ai Car search and test drive from thousands of cars
            </p>

            {/*Search-component} */}
            <HomeSearch />
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="cointainer mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold ">Features Cars</h2>
            <Button varient="ghost" className={"flex items-center"}>
              <Link href={"/cars"}>See All</Link>{" "}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => {
              return <CarCard key={car.id} car={car} />;
            })}
          </div>
        </div>
      </section>{" "}
      //first section
      <section className="py-20">
        <div className="cointainer mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold ">Features Cars</h2>
            <Button varient="ghost" className={"flex items-center"}>
              <Link href={"/cars"}>See All</Link>{" "}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {carMakes.map((make) => {
              return (
                <Link
                  key={make.name}
                  href={`/cars?make=${make.name}`}
                  className="bg-white rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="h-16 w-auto mx-auto mb-2 relative">
                    <Image
                      src={make.image}
                      alt={make.name}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <h3 className="font-medium text-center">{make.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      // second section
      <section className="py-15">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Why Choose Our Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <Car className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p>
                Thousands of verified vehicles from trusted dealerships and private sellers.
              </p>
            </div>
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trusted Dealers</h3>
              <p>
                We partner only with reputable dealerships to ensure quality and reliability.
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Process</h3>
              <p>
                Streamlined browsing, financing, and test drives for a seamless experience.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-20">
        <div className="cointainer mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold ">Browse by body Type</h2>
            <Button varient="ghost" className={"flex items-center"}>
              <Link href={"/cars"}>See All</Link>{" "}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {bodyTypes.map((type) => {
              return (
                <Link
                  key={type.name}
                  href={`/cars?bodyType=${type.name}`}
                  className="relative group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg flex justify-end h-28 mb-4 relative">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-all duration-300 ease-in-out"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex items-end">

                  <h3 className="text-white text-xl font-bold pl-4 pb02 text-center">{type.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8"> Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq,index) => {
              return(

  <AccordionItem key={index} value={`item-${index}`}>
    <AccordionTrigger>{faq.question}</AccordionTrigger>
    <AccordionContent>
      {faq.answer}
    </AccordionContent>
  </AccordionItem>
              )
})}
</Accordion>

        </div>
      </section>
      <section className="py-20 dotted-background text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to find Car match your vibe 😎</h2>
          <p className="text-xl text-blue-100 mb-8 max-2-2xl mx-auto">join thousands of happy customers and find your dream car</p>
<div className="flex flex-col sm:flex-row justify-center gap-4">

          <Button size={"lg"} variant={"secondary"} asChild>
            <Link href="/cars">Browse all Cars</Link>
          </Button>
          <SignedOut>
            <Button size={"lg"} asChild>
              <Link href="/sign-up">Sign up now !</Link>
            </Button>
          </SignedOut>
</div>
        </div>
      </section>
    </div>
  );
}
