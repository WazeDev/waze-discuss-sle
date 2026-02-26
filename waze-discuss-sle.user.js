// ==UserScript==
// @name         Waze Discuss See Last Editor
// @namespace    https://github.com/WazeDev/waze-discuss-sle
// @version      0.0.1
// @description  See who last edited a Wazeopedia topic on Waze Discuss.
// @author       Gavin Canon-Phratsachack (https://github.com/gncnpk)
// @match        https://www.waze.com/discuss/c/wazeopedia*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant        GM_xmlhttpRequest
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

(function() {
    "use strict";

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const makeRequest = (url) => {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                headers: {
                    "Content-Type": "application/json",
                },
                onload: (response) => {
                    if (response.status === 200) {
                        resolve(JSON.parse(response.responseText));
                    } else {
                        reject(response.status);
                    }
                },
                onerror: reject,
            });
        });
    };

    const processTopics = async () => {
        const table = document.getElementsByClassName("topic-list")[0];
        const topics = table.children[2].querySelectorAll("tr.topic-list-item");
        const rootPostURL = "https://www.waze.com/discuss/posts/";
        const postSuffix = "/revisions/latest.json";
        const rootTopicURL = "https://www.waze.com/discuss/t/";

        for (const topic of topics) {
            try {
                const topicId = topic.attributes[0].value;
                const topicCreatedBySection = topic
                    .querySelector(".link-bottom-line")
                    .parentElement;

                // Get topic details
                console.log("Getting latest post ID...");
                const topicData = await makeRequest(`${rootTopicURL}${topicId}.json`);
                await delay(100); // Wait 0.1 seconds

                // Get post revision
                const postId = topicData.post_stream.stream[0];
                console.log("Getting latest revision...");
                const latestRevision = await makeRequest(
                    `${rootPostURL}${postId}${postSuffix}`
                );
                await delay(100); // Wait 0.1 seconds

                // Update UI
                console.log("Displaying last editor on topic...");
                const editedByElm = document.createElement("wz-body2");
                const linkToEditorProfile = document.createElement("a");
                editedByElm.className = "created-title";
                editedByElm.innerText = `Last edited by `;
                linkToEditorProfile.href = `https://www.waze.com/discuss/u/${latestRevision.username}`;
                linkToEditorProfile.innerText = latestRevision.username;
                editedByElm.appendChild(linkToEditorProfile);
                topicCreatedBySection.insertBefore(
                    editedByElm,
                    topicCreatedBySection.lastChild
                );
            } catch (error) {
                console.error("Error processing topic:", error);
            }
        }
    };

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", processTopics);
    } else {
        // DOM is already loaded
        processTopics();
    }
})();
