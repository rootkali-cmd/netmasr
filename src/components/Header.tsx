"use client";

import Link from "next/link";
import { useState } from "react";
import SiteBrand from "./SiteBrand";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="no-underline">
            <SiteBrand />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/posts" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors no-underline">
              المشاركات
            </Link>
            <Link href="/polls" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors no-underline">
              الاستفتاءات
            </Link>
            <Link href="/rules" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors no-underline">
              القواعد
            </Link>
            <Link href="/about" className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors no-underline">
              عن المنصة
            </Link>
            <Link href="/posts/new" className="btn btn-primary btn-sm mr-2">
              اكتب رأيك
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="القائمة"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-2">
            <Link href="/posts" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md no-underline" onClick={() => setMenuOpen(false)}>
              المشاركات
            </Link>
            <Link href="/polls" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md no-underline" onClick={() => setMenuOpen(false)}>
              الاستفتاءات
            </Link>
            <Link href="/rules" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md no-underline" onClick={() => setMenuOpen(false)}>
              القواعد
            </Link>
            <Link href="/about" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-md no-underline" onClick={() => setMenuOpen(false)}>
              عن المنصة
            </Link>
            <Link href="/posts/new" className="block px-3 py-2 mt-2 btn btn-primary btn-sm no-underline" onClick={() => setMenuOpen(false)}>
              اكتب رأيك
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}