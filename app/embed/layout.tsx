// Sets the initial embed theme from the ?theme= query param before the page
// paints (the host dashboard loads /embed/*?theme=dark). Live switches after
// load arrive via the 'aerion-embed-theme' postMessage handled in EmbedShell.
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(new URLSearchParams(location.search).get('theme')==='dark')document.documentElement.setAttribute('data-embed-theme','dark')}catch(e){}",
        }}
      />
      {children}
    </>
  );
}
