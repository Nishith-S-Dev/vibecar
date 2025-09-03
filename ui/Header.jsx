import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut,SignInButton,UserButton } from "@clerk/nextjs";
import { ArrowBigLeft, CarFront, CarFrontIcon, Heart, HeartIcon, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkUser } from "@/lib/checkUser";

const Header = async ({isAdminPage= false}) => {
  const user = await checkUser();
  const isAdmin = user?.role==="ADMIN";
  return (
  <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
    <nav className="flex items-center justify-between p-4">
      <Link href={isAdminPage ? "/admin" : "/"} className="flex gap-5 ">
      <Image src={"/logo.png"}
      width={200}
      height={200}
      alt="logo"
      className="h-12 w-auto object-contain"
      />
      { isAdminPage && (
        <span className="text-sm font-bold text-red-600 relative top-7">Admin Panel</span>
         )}
      </Link>
      <div className="flex  items-center space-x-4">

      { isAdminPage ?(
        <Link href="/saved-cars">
        <Button>
          <ArrowBigLeft size = {20}/>
          <span className="">Backed to App</span>
        </Button>
        </Link>
        ):(<SignedIn>
          <Link href="/saved-cars">
          <Button>
            <HeartIcon size = {20}/>
            <span className="hidden md:inline">SavedCar</span>
          </Button>
          </Link>
          
          {!isAdmin ?(<Link href="/reservations">
          <Button >
            <CarFrontIcon size = {20}/>
            <span className="hidden md:inline">My Reservation</span>
          </Button>
          
      </Link>
          ): (
          <Link href="/admin">
          <Button >
            <Layout size = {20}/>
            <span className="hidden md:inline">Admin Portal</span>
          </Button>
      </Link>
          )}
      </SignedIn>
      )}
      <SignedOut>
        <SignInButton forceRedirectUrl="/">
          <Button>login</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
      <UserButton
  appearance={{
    elements: {
      avatarBox: "w-20 h-20",
      avatarImage: "w-20 h-20", // sometimes needed to enlarge the image inside the box
    },
  }}
/>
      </SignedIn>
      </div>
    </nav>
  </header>
  );
};

export default Header;
   