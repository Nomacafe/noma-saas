import MenuClient from './MenuClient'
import { getFullCatalog } from '@/app/actions/sessions'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const { drinks, extras, addons } = await getFullCatalog()
  return <MenuClient initialDrinks={drinks} initialExtras={extras} initialAddons={addons} />
}
