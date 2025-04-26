# thoughtful feature

store subscripiton alerts in cache and delete from cache when a subscription that is in alerted status is deleted. Don't need to go to back end to get current subscriptions this way.

right now fetching subscription every 30 seconds for a subscription under alert status. Could cache this to minimize back end api calls all I need is stop location to calculate distance. only problem is what if user updates the subscription while under alerted status to a new stop. Then maybe not make possible to change route or stop of a subscription only time and weekday...

in future as more back end calls get caching make a caching wrapper so don't have to repeat this code at every call with different storage key. look at GetSubscriptionById for reference of caching

i COULD get a stop details after fetching subscription and linking that way but I know somewhere in the code I am already fetching stop details and linking to subscription maybe I can reuse that object instead of doing it again.

I need the stop location right in the subscription alert so I don't have to go to backend again.

when refreshing data to a new radius zoom out/in to encompass new radisu

really cool "updateProximityAlertDistances"

When a vehicle is selected it won't become part of a cluster on zoom out.