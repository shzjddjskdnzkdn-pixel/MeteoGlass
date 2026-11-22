"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow,
  Compass, Droplets, MapPin, RefreshCw, Search, Sun, Sunrise, Sunset,
  Thermometer, Umbrella, Wind, LocateFixed, AlertTriangle
} from "lucide-react";

type Place = { name: string; admin1?: string; latitude: number; longitude: number; country?: string };
type Weather = {
  current: { temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; is_day: number; precipitation: number; weather_code: number; wind_speed_10m: number; wind_direction_10m: number };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; sunrise: string[]; sunset: string[]; uv_index_max: number[] };
};

const weatherLabel = (code: number) => {
  if (code === 0) return "Ciel dégagé";
  if ([1, 2].includes(code)) return "Peu nuageux";
  if (code === 3) return "Couvert";
  if ([45, 48].includes(code)) return "Brouillard";
  if ([51, 53, 55, 56, 57].includes(code)) return "Bruine";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Pluie";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neige";
  if ([95, 96, 99].includes(code)) return "Orage";
  return "Conditions variables";
};
const WeatherIcon = ({ code, size = 28 }: { code: number; size?: number }) => {
  if (code === 0 || code === 1) return <Sun size={size} strokeWidth={1.5} />;
  if ([45, 48].includes(code)) return <CloudFog size={size} strokeWidth={1.5} />;
  if ([51,53,55,56,57].includes(code)) return <CloudDrizzle size={size} strokeWidth={1.5} />;
  if ([61,63,65,66,67,80,81,82].includes(code)) return <CloudRain size={size} strokeWidth={1.5} />;
  if ([71,73,75,77,85,86].includes(code)) return <CloudSnow size={size} strokeWidth={1.5} />;
  if ([95,96,99].includes(code)) return <CloudLightning size={size} strokeWidth={1.5} />;
  return <Cloud size={size} strokeWidth={1.5} />;
};
const hour = (value: string) => new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit" });
const dayName = (value: string, i: number) => i === 0 ? "Aujourd’hui" : new Date(value).toLocaleDateString("fr-FR", { weekday: "short" });

export default function Home() {
  const [place, setPlace] = useState<Place>({ name: "Paris", admin1: "Île-de-France", latitude: 48.8566, longitude: 2.3522, country: "France" });
  const [weather, setWeather] = useState<Weather | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState<Date | null>(null);

  const loadWeather = useCallback(async (p: Place) => {
    setLoading(true); setError("");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&forecast_days=7&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Les données météo sont momentanément indisponibles.");
      const data = await response.json();
      setWeather(data); setUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadWeather(place); }, [place, loadWeather]);
  useEffect(() => {
    const timer = setInterval(() => loadWeather(place), 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [place, loadWeather]);

  const searchPlaces = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=fr&format=json`);
      const d = await r.json();
      setResults((d.results || []).map((x: any) => ({ name: x.name, admin1: x.admin1, latitude: x.latitude, longitude: x.longitude, country: x.country })));
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  const locateMe = () => {
    if (!navigator.geolocation) { setError("La géolocalisation n’est pas disponible sur cet appareil."); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      setPlace({ name: "Ma position", latitude: coords.latitude, longitude: coords.longitude });
      setResults([]);
    }, () => setError("Autorise la localisation dans les réglages de ton navigateur pour utiliser cette fonction."));
  };

  const hourly = useMemo(() => {
    if (!weather) return [];
    const now = new Date();
    return weather.hourly.time.map((t, i) => ({ time: t, temp: weather.hourly.temperature_2m[i], rain: weather.hourly.precipitation_probability[i], code: weather.hourly.weather_code[i] }))
      .filter(x => new Date(x.time) >= new Date(now.getTime() - 60 * 60 * 1000)).slice(0, 12);
  }, [weather]);

  const current = weather?.current;
  const daily = weather?.daily;

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><Sun size={19} /></span><span>Meteo<span className="brand-light">Glass</span></span></a>
        <div className="top-actions"><span className="live-dot" /> <span className="live-label">Données actualisées</span><button className="icon-button" onClick={() => loadWeather(place)} aria-label="Actualiser"><RefreshCw size={17}/></button></div>
      </header>

      <section className="intro">
        <div className="eyebrow">VOTRE MÉTÉO, EN UN COUP D’ŒIL</div>
        <h1>Le ciel, <span>en transparence.</span></h1>
        <p className="subtitle">Les conditions météo près de chez vous et partout en France.</p>
      </section>

      <section className="search-wrap glass">
        <div className="search-line"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchPlaces()} placeholder="Rechercher une ville…" aria-label="Rechercher une ville"/><button onClick={searchPlaces} disabled={searching}>{searching ? "…" : "Rechercher"}</button><button className="locate" onClick={locateMe} aria-label="Utiliser ma position"><LocateFixed size={18}/></button></div>
        {results.length > 0 && <div className="results">{results.map((r, i) => <button key={`${r.name}-${i}`} onClick={() => { setPlace(r); setResults([]); setQuery(""); }}><MapPin size={15}/><span>{r.name}</span><small>{[r.admin1, r.country].filter(Boolean).join(", ")}</small></button>)}</div>}
      </section>

      {error && <div className="error"><AlertTriangle size={17}/>{error}</div>}

      <section className="hero-card glass">
        <div className="hero-glow"/>
        <div className="hero-top"><div><div className="location"><MapPin size={15}/>{place.name}{place.admin1 ? `, ${place.admin1}` : ""}</div><div className="date">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div></div><div className="source-pill"><span/> MÉTÉO EN DIRECT</div></div>
        {loading && !current ? <div className="loading">Chargement de la météo…</div> : current ? <>
          <div className="hero-main"><div><div className="temperature">{Math.round(current.temperature_2m)}<span>°</span></div><div className="condition">{weatherLabel(current.weather_code)}</div><div className="feels">Ressenti {Math.round(current.apparent_temperature)}°</div></div><div className="hero-weather-icon"><WeatherIcon code={current.weather_code} size={94}/></div></div>
          <div className="hero-bottom"><div><Thermometer size={17}/><span>Ressenti</span><b>{Math.round(current.apparent_temperature)}°</b></div><div><Droplets size={17}/><span>Humidité</span><b>{current.relative_humidity_2m}%</b></div><div><Wind size={17}/><span>Vent</span><b>{Math.round(current.wind_speed_10m)} km/h</b></div><div><Umbrella size={17}/><span>Précipitations</span><b>{current.precipitation} mm</b></div></div>
        </> : <div className="loading">Impossible de charger les données.</div>}
      </section>

      <section className="section">
        <div className="section-heading"><div><div className="eyebrow">LES PROCHAINES HEURES</div><h2>Heure par heure</h2></div><span className="section-note">Prévisions locales</span></div>
        <div className="hourly glass">
          {hourly.length ? hourly.map((h, i) => <div className="hour" key={h.time}><span className="hour-time">{i === 0 ? "Maintenant" : hour(h.time)}</span><WeatherIcon code={h.code} size={23}/><b>{Math.round(h.temp)}°</b><small><Droplets size={11}/>{h.rain}%</small></div>) : <div className="loading">Les prévisions apparaîtront ici.</div>}
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><div className="eyebrow">TENDANCE À VENIR</div><h2>Les 7 prochains jours</h2></div><span className="section-note">France · Prévisions</span></div>
        <div className="forecast glass">
          {daily?.time.map((d, i) => <div className="day" key={d}><span className="day-name">{dayName(d, i)}</span><WeatherIcon code={daily.weather_code[i]} size={23}/><span className="day-desc">{weatherLabel(daily.weather_code[i])}</span><div className="temps"><b>{Math.round(daily.temperature_2m_max[i])}°</b><span>{Math.round(daily.temperature_2m_min[i])}°</span></div></div>)}
          {!daily && <div className="loading">Chargement des prévisions…</div>}
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><div className="eyebrow">SÉCURITÉ</div><h2>Vigilances météo</h2></div><span className="section-note">France entière</span></div>
        <div className="vigilance glass"><div className="vigilance-icon"><AlertTriangle size={22}/></div><div><b>Bulletins officiels à connecter</b><p>Cette première version affiche déjà les prévisions. Les vigilances détaillées de Météo-France seront ajoutées via leur flux officiel après configuration de l’accès aux données.</p></div><span className="status-tag">À configurer</span></div>
      </section>

      <footer><div className="footer-brand">MeteoGlass</div><p>Prévisions fournies par Open-Meteo · Actualisation automatique toutes les 15 minutes.</p><p className="footer-small">Les prévisions sont indicatives et ne remplacent pas les consignes officielles de sécurité. Consultez Météo-France pour les vigilances en cours.</p>{updated && <p className="updated">Dernière mise à jour : {updated.toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"})}</p>}</footer>
    </main>
  );
}
