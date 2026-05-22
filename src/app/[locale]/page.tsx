import {
  getSiteConfig, getServices, getFeaturedPortfolio,
  getAwards, getFeaturedFaq,
} from '@/lib/content'
import { HeroSection } from '@/components/home/HeroSection'
import { WhoWeAreSection } from '@/components/home/WhoWeAreSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { PortfolioHighlightSection } from '@/components/home/PortfolioHighlightSection'
import { AwardsSection } from '@/components/home/AwardsSection'
import { WayOfWorkSection } from '@/components/home/WayOfWorkSection'
import { FaqPreviewSection } from '@/components/home/FaqPreviewSection'
import { ContactFormSection } from '@/components/home/ContactFormSection'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const site = getSiteConfig()
  const services = getServices()
  const portfolio = getFeaturedPortfolio()
  const awards = getAwards()
  const faq = getFeaturedFaq()

  return (
    <>
      <HeroSection site={site} />
      <WhoWeAreSection site={site} locale={locale} />
      <ServicesSection services={services} locale={locale} />
      <PortfolioHighlightSection items={portfolio} locale={locale} />
      <AwardsSection awards={awards} locale={locale} />
      <WayOfWorkSection steps={site.pipeline} locale={locale} />
      <FaqPreviewSection items={faq} locale={locale} />
      <ContactFormSection services={services} locale={locale} />
    </>
  )
}
