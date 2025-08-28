'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/client'

interface HomeSettings {
  // Hero Section
  hero: {
    video1: {
      url: string | null
      topText: { en: string | null; fr: string | null }
      mainText: { en: string | null; fr: string | null }
      discoverLink: string | null
    }
    video2: {
      url: string | null
      topText: { en: string | null; fr: string | null }
      mainText: { en: string | null; fr: string | null }
      discoverLink: string | null
    }
  }
  // Collections Section
  collections: {
    title: { en: string | null; fr: string | null }
    subtitle: { en: string | null; fr: string | null }
    image1Url: string | null
    image2Url: string | null
  }
  // Categories Section
  categories: {
    title: { en: string | null; fr: string | null }
    category1: {
      id: number | null
      name: string | null
      subtitle: { en: string | null; fr: string | null }
      link: string | null
      imageUrl: string | null
    }
    category2: {
      id: number | null
      name: string | null
      subtitle: { en: string | null; fr: string | null }
      link: string | null
      imageUrl: string | null
    }
    category3: {
      id: number | null
      name: string | null
      subtitle: { en: string | null; fr: string | null }
      link: string | null
      imageUrl: string | null
    }
  }
  // Creators Section
  creators: {
    title: { en: string | null; fr: string | null }
    subtitle: { en: string | null; fr: string | null }
    images: string[]
  }
  // Footer Settings
  footer: {
    social: {
      facebook: string | null
      instagram: string | null
      twitter: string | null
      linkedin: string | null
    }
    categoryIds: number[]
    links: {
      origin: string | null
      events: string | null
      myAccount: string | null
      ordersDelivery: string | null
      cookiesPrivacy: string | null
      terms: string | null
    }
  }
}

export function useHomeSettings() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['home-settings'],
    queryFn: async (): Promise<HomeSettings> => {
      // Fetch settings
      const { data, error } = await supabase
        .schema('morpheus')
        .from('settings')
        .select('key, value')

      if (error) {
        throw new Error(error.message)
      }

      // Create a map for easy lookup
      const settingsMap = new Map(data.map(setting => [setting.key, setting.value]))

      // Helper function to get setting value
      const getSetting = (key: string): string | null => settingsMap.get(key) || null

      // Helper function to parse JSON safely
      const parseJSON = (value: string | null, fallback: any = []): any => {
        if (!value) return fallback
        try {
          return JSON.parse(value)
        } catch {
          return fallback
        }
      }

      // Helper function to parse number
      const parseNumber = (value: string | null): number | null => {
        if (!value) return null
        const num = parseInt(value, 10)
        return isNaN(num) ? null : num
      }

      // Get category IDs for fetching names
      const categoryIds = [
        parseNumber(getSetting('homepage_categories_category1_id')),
        parseNumber(getSetting('homepage_categories_category2_id')),
        parseNumber(getSetting('homepage_categories_category3_id'))
      ].filter(id => id !== null) as number[]

      // Fetch category names if we have category IDs
      let categoryNames: Record<number, string> = {}
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .schema('morpheus')
          .from('xcategprod')
          .select('xcategprodid, xcategprodintitule')
          .in('xcategprodid', categoryIds)

        if (categories) {
          categoryNames = categories.reduce((acc, cat) => {
            acc[cat.xcategprodid] = cat.xcategprodintitule
            return acc
          }, {} as Record<number, string>)
        }
      }

      return {
        hero: {
          video1: {
            url: getSetting('homepage_hero_video1_url'),
            topText: {
              en: getSetting('homepage_hero_video1_top_text_en'),
              fr: getSetting('homepage_hero_video1_top_text_fr')
            },
            mainText: {
              en: getSetting('homepage_hero_video1_main_text_en'),
              fr: getSetting('homepage_hero_video1_main_text_fr')
            },
            discoverLink: getSetting('homepage_hero_video1_discover_link')
          },
          video2: {
            url: getSetting('homepage_hero_video2_url'),
            topText: {
              en: getSetting('homepage_hero_video2_top_text_en'),
              fr: getSetting('homepage_hero_video2_top_text_fr')
            },
            mainText: {
              en: getSetting('homepage_hero_video2_main_text_en'),
              fr: getSetting('homepage_hero_video2_main_text_fr')
            },
            discoverLink: getSetting('homepage_hero_video2_discover_link')
          }
        },
        collections: {
          title: {
            en: getSetting('homepage_collections_title_en'),
            fr: getSetting('homepage_collections_title_fr')
          },
          subtitle: {
            en: getSetting('homepage_collections_subtitle_en'),
            fr: getSetting('homepage_collections_subtitle_fr')
          },
          image1Url: getSetting('homepage_collections_image1_url'),
          image2Url: getSetting('homepage_collections_image2_url')
        },
        categories: {
          title: {
            en: getSetting('homepage_categories_title_en'),
            fr: getSetting('homepage_categories_title_fr')
          },
          category1: {
            id: parseNumber(getSetting('homepage_categories_category1_id')),
            name: parseNumber(getSetting('homepage_categories_category1_id')) ?
              categoryNames[parseNumber(getSetting('homepage_categories_category1_id'))!] || null : null,
            subtitle: {
              en: getSetting('homepage_categories_category1_subtitle_en'),
              fr: getSetting('homepage_categories_category1_subtitle_fr')
            },
            link: getSetting('homepage_categories_category1_link'),
            imageUrl: getSetting('homepage_categories_category1_image_url')
          },
          category2: {
            id: parseNumber(getSetting('homepage_categories_category2_id')),
            name: parseNumber(getSetting('homepage_categories_category2_id')) ?
              categoryNames[parseNumber(getSetting('homepage_categories_category2_id'))!] || null : null,
            subtitle: {
              en: getSetting('homepage_categories_category2_subtitle_en'),
              fr: getSetting('homepage_categories_category2_subtitle_fr')
            },
            link: getSetting('homepage_categories_category2_link'),
            imageUrl: getSetting('homepage_categories_category2_image_url')
          },
          category3: {
            id: parseNumber(getSetting('homepage_categories_category3_id')),
            name: parseNumber(getSetting('homepage_categories_category3_id')) ?
              categoryNames[parseNumber(getSetting('homepage_categories_category3_id'))!] || null : null,
            subtitle: {
              en: getSetting('homepage_categories_category3_subtitle_en'),
              fr: getSetting('homepage_categories_category3_subtitle_fr')
            },
            link: getSetting('homepage_categories_category3_link'),
            imageUrl: getSetting('homepage_categories_category3_image_url')
          }
        },
        creators: {
          title: {
            en: getSetting('homepage_creators_title_en'),
            fr: getSetting('homepage_creators_title_fr')
          },
          subtitle: {
            en: getSetting('homepage_creators_subtitle_en'),
            fr: getSetting('homepage_creators_subtitle_fr')
          },
          images: parseJSON(getSetting('homepage_creators_images'), [])
        },
        footer: {
          social: {
            facebook: getSetting('footer_social_facebook_url'),
            instagram: getSetting('footer_social_instagram_url'),
            twitter: getSetting('footer_social_twitter_url'),
            linkedin: getSetting('footer_social_linkedin_url')
          },
          categoryIds: parseJSON(getSetting('footer_categories_ids'), []),
          links: {
            origin: getSetting('footer_link_origin'),
            events: getSetting('footer_link_events'),
            myAccount: getSetting('footer_link_my_account'),
            ordersDelivery: getSetting('footer_link_orders_delivery'),
            cookiesPrivacy: getSetting('footer_link_cookies_privacy'),
            terms: getSetting('footer_link_terms')
          }
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
