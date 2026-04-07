import config from "@/lib/config";

const apiEndpoint = config.env.api.endpoint;

const apiRoutes = {
    ai :{
        analyzeFood : `${apiEndpoint}/ai/analyze-food`,
        findRestaurants : `${apiEndpoint}/ai/find-restaurants`,
        identifyPlace : `${apiEndpoint}/ai/identify-place`,
        visaAnalysis : `${apiEndpoint}/ai/visa-analysis`,
        analyzePlace : `${apiEndpoint}/ai/analyze-place`,
        tripsCreate : `${apiEndpoint}/ai/trips/create`,
        chat : `${apiEndpoint}/ai/chat`
    },
    webhooks :{
        clerk : `${apiEndpoint}/webhooks/clerk`
    }
}

export default apiRoutes;