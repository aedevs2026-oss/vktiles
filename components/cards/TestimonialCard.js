import AppImage from "@/components/ui/AppImage";

export default function TestimonialCard({ testimonial }) {
  return (
    <article className="bg-white p-8 card-hover h-full flex flex-col">
      <div className="flex gap-1 mb-5" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <blockquote className="text-dark/80 text-sm leading-relaxed flex-1 mb-6">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <footer className="flex items-center gap-4">
        <AppImage
          src={testimonial.avatar}
          alt={testimonial.name}
          width={48}
          height={48}
          wrapperClassName="shrink-0 rounded-full"
          className="rounded-full object-cover"
        />
        <div>
          <cite className="not-italic font-medium text-dark text-sm block">
            {testimonial.name}
          </cite>
          <p className="text-gray text-xs">{testimonial.role}</p>
        </div>
      </footer>
    </article>
  );
}
