<script lang="ts">
  export let data
  import { onMount } from 'svelte'
  import { page } from '$app/stores'

  const appName = 'Apple Music Auth Gateway'
  const appBuild = '2023.10'
  const appVersion = '1.0.0'

  const onWindowMessage = async ({ origin, data }: MessageEvent) => {
    if (origin === 'https://authorize.music.apple.com') {
      const { method, params } = data
      //console.log(method, params)
    }
  }

  let userToken: string | undefined = undefined
  let storefront: string | undefined = undefined

  $: redirect = $page.url.searchParams.get('redirect')
  $: state = $page.url.searchParams.get('state')

  const signInToAM = async () => {
    const m = MusicKit.getInstance()
    try {
      userToken = await m.authorize()
      storefront = (await m.me()).storefront
      if (redirect) {
        slowRedirect(redirect)
      }
    } catch (e) {
      console.error('Authentication failed')
    }
  }

  const signOutOfAM = async () => {
    const m = MusicKit.getInstance()
    try {
      await m.unauthorize()
      userToken = undefined
      storefront = undefined
    } catch (e) {
      console.error('Unauthentication failed')
    }
  }

  const slowRedirect = async (redirectUrl: string) => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    if (userToken && storefront) {
      const url = new URL(redirectUrl)
      url.searchParams.append('userToken', userToken)
      url.searchParams.append('storefront', storefront)
      if (state) {
        url.searchParams.append('state', state)
      }
      window.location.replace(url)
    }
  }

  onMount(async () => {
    MusicKit.configure({
      app: {
        name: appName,
        build: appBuild,
        version: appVersion,
        //icon: ''
      },
      developerToken: data.token,
      declarativeMarkup: false,
    })
    await signInToAM()
  })
</script>

<svelte:window on:message={onWindowMessage} />

<svelte:head>
  <script src="https://js-cdn.music.apple.com/musickit/v1/musickit.js"></script>
</svelte:head>

<br />
{#if userToken}
  You are signed in to Apple Music!
  {#if redirect}
    You will be redirected in a few seconds.
  {/if}
  <button on:click={signOutOfAM}>Logout</button>
{:else}
  A login window should appear as a popup. If you don't see it, click login:
  <button on:click={signInToAM}>Login</button>
{/if}
