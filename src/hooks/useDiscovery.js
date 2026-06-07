import { useEffect, useState } from "react";
import { getWebsiteMedia, getSetting } from "../services/discovery";
import { cache } from "../utils/cache";

export const useDiscoveryMedia = () => {
  const [discoveryMedia, setDiscoveryMedia] = useState(() => {
    return cache.get("discovery_media_data") || [];
  });
  const [loading, setLoading] = useState(() => {
    return !cache.get("discovery_media_data");
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = cache.get("discovery_media_data");
    const isStale = cache.isStale("discovery_media_data", 120000);

    if (cached && !isStale) {
      setLoading(false);
      return;
    }

    const fetchFromAPI = async () => {
      try {
        if (!cached) setLoading(true);
        // مررنا اسم الكي الخاص بالـ discovery للباك إند
        const res = await getWebsiteMedia("discovery_media");

        // الباك إند الحين بيرجعها جوه كائن اسمه images مباشرة
        const data = res?.data?.data?.images || [];
        cache.set("discovery_media_data", data);
        setDiscoveryMedia(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFromAPI();
  }, []);

  return { discoveryMedia, loading, error };
};

export const clearHeroAndAboutCache = () => {
  cache.clear("hero_and_about_data");
};

export const useHeroAndAboutData = () => {
  const [heroImage, setHeroImage] = useState(() => {
    const cached = cache.get("hero_and_about_data");
    return cached ? cached.heroImage : null;
  });

  const [aboutImages, setAboutImages] = useState(() => {
    const cached = cache.get("hero_and_about_data");
    return cached ? cached.aboutImages : [];
  });

  const [heroSettings, setHeroSettings] = useState(() => {
    const cached = cache.get("hero_and_about_data");
    return cached ? cached.heroSettings : {
      hero_title_en: "",
      hero_title_ar: "",
      hero_title_highlight_en: "",
      hero_title_highlight_ar: "",
      hero_subtitle_en: "",
      hero_subtitle_ar: "",
    };
  });

  const [loading, setLoading] = useState(() => {
    return !cache.get("hero_and_about_data");
  });

  useEffect(() => {
    const cached = cache.get("hero_and_about_data");
    const isStale = cache.isStale("hero_and_about_data", 120000);

    if (cached && !isStale) {
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        if (!cached) setLoading(true);
        const [
          heroRes,
          aboutRes,
          titleEnRes,
          titleArRes,
          highlightEnRes,
          highlightArRes,
          subtitleEnRes,
          subtitleArRes,
        ] = await Promise.all([
          getWebsiteMedia("hero_image"),
          getWebsiteMedia("about_media"),
          getSetting("hero_title_en").catch(() => null),
          getSetting("hero_title_ar").catch(() => null),
          getSetting("hero_title_highlight_en").catch(() => null),
          getSetting("hero_title_highlight_ar").catch(() => null),
          getSetting("hero_subtitle_en").catch(() => null),
          getSetting("hero_subtitle_ar").catch(() => null),
        ]);

        const heroImageVal = heroRes?.data?.data?.hero_image || null;
        const aboutImagesVal = aboutRes?.data?.data?.about_images || [];

        // حقن preload للصورة فوراً بعد ما الـ API يرجع — البراوزر يبدأ التحميل قبل ما React يعمل re-render
        if (heroImageVal && !document.querySelector('link[data-hero-preload]')) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = heroImageVal;
          link.setAttribute('data-hero-preload', 'true');
          document.head.appendChild(link);
        }

        const extractVal = (res) => {
          if (!res) return "";
          const body = res.data !== undefined ? res.data : res;
          if (!body) return "";
          if (typeof body === "string") return body;
          const data = body.data !== undefined ? body.data : body;
          if (!data) return "";
          if (typeof data === "string") return data;
          if (typeof data === "object" && data.value !== undefined && data.value !== null) {
            return data.value;
          }
          return "";
        };

        const heroSettingsVal = {
          hero_title_en: extractVal(titleEnRes),
          hero_title_ar: extractVal(titleArRes),
          hero_title_highlight_en: extractVal(highlightEnRes),
          hero_title_highlight_ar: extractVal(highlightArRes),
          hero_subtitle_en: extractVal(subtitleEnRes),
          hero_subtitle_ar: extractVal(subtitleArRes),
        };

        cache.set("hero_and_about_data", {
          heroImage: heroImageVal,
          aboutImages: aboutImagesVal,
          heroSettings: heroSettingsVal,
        });

        setHeroImage(heroImageVal);
        setAboutImages(aboutImagesVal);
        setHeroSettings(heroSettingsVal);
      } catch (err) {
        console.error("Error fetching website content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return { heroImage, aboutImages, heroSettings, loading };
};

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState(() => {
    return cache.get("contact_info_settings") || { whatsapp: "", contact_email: "", facebook_url: "" };
  });
  const [loading, setLoading] = useState(() => {
    return !cache.get("contact_info_settings");
  });

  useEffect(() => {
    const cached = cache.get("contact_info_settings");
    const isStale = cache.isStale("contact_info_settings", 120000);

    if (cached && !isStale) {
      setLoading(false);
      return;
    }

    const fetchContactInfo = async () => {
      try {
        if (!cached) setLoading(true);
        const [whatsappRes, emailRes, facebookRes] = await Promise.all([
          getSetting("whatsapp").catch(() => null),
          getSetting("contact_email").catch(() => null),
          getSetting("facebook_url").catch(() => null),
        ]);

        const extractVal = (res) => {
          if (!res) return "";
          const body = res.data !== undefined ? res.data : res;
          if (!body) return "";
          if (typeof body === "string") return body;
          const data = body.data !== undefined ? body.data : body;
          if (!data) return "";
          if (typeof data === "string") return data;
          if (typeof data === "object" && data.value !== undefined && data.value !== null) {
            return data.value;
          }
          return "";
        };

        const info = {
          whatsapp: extractVal(whatsappRes),
          contact_email: extractVal(emailRes),
          facebook_url: extractVal(facebookRes),
        };

        cache.set("contact_info_settings", info);
        setContactInfo(info);
      } catch (err) {
        console.error("Error fetching contact info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  return { ...contactInfo, loading };
};
