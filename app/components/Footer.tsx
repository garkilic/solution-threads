export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-charcoal/10">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="text-2xl font-medium text-charcoal">
          Solution Threads
        </p>
        <p className="text-sm text-gray">
          © {new Date().getFullYear()} All rights reserved
        </p>
      </div>
    </footer>
  );
}
