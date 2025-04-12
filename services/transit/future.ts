// const serviceAlerts = await axios({
        //     method: 'get',
        //     url: 'https://data.calgary.ca/download/jhgn-ynqj/application%2Foctet-stream',
        //     responseType: 'arraybuffer',
        // });
        // const tripUpdates = await axios({
        //     method: 'get',
        //     url: 'https://data.calgary.ca/download/gs4m-mdc2/application%2Foctet-stream',
        //     responseType: 'arraybuffer',
        // });
        // const serviceAlertsFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        //     new Uint8Array(serviceAlerts.data)
        // );
        // const tripUpdatesFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        //     new Uint8Array(tripUpdates.data)
        // );