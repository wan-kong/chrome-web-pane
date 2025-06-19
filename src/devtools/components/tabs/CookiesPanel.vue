<template>
    <div class="cookies-panel">
        <div v-if="request" class="cookies-content">
            <div class="cookies-section">
                <h4>Request Cookies</h4>
                <div v-if="requestCookies.length > 0" class="cookies-table">
                    <div v-for="cookie in requestCookies" :key="cookie.name" class="cookie-row">
                        <span class="cookie-name">{{ cookie.name }}</span>
                        <span class="cookie-value">{{ cookie.value }}</span>
                    </div>
                </div>
                <div v-else class="no-cookies">No request cookies</div>
            </div>

            <div class="cookies-section">
                <h4>Response Cookies</h4>
                <div v-if="responseCookies.length > 0" class="cookies-table">
                    <div v-for="cookie in responseCookies" :key="cookie" class="cookie-row">
                        <span class="cookie-value">{{ cookie }}</span>
                    </div>
                </div>
                <div v-else class="no-cookies">No response cookies</div>
            </div>
        </div>
        <div v-else class="no-request">
            Select a request to view cookies
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    request: any
}

defineProps<Props>()

const requestCookies: any[] = []
const responseCookies: any[] = []
</script>

<style scoped>
.cookies-panel {
    height: 100%;
    padding: 12px;
}

.cookies-section {
    margin-bottom: 24px;
}

.cookies-section h4 {
    font-size: 13px;
    margin-bottom: 12px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
}

.cookie-row {
    display: flex;
    margin-bottom: 8px;
    font-size: 11px;
    padding: 4px 0;
    border-bottom: 1px solid #f0f0f0;
}

.cookie-name {
    font-weight: 600;
    min-width: 120px;
    color: #666;
    margin-right: 8px;
}

.cookie-value {
    color: #333;
    word-break: break-all;
    flex: 1;
}

.no-cookies,
.no-request {
    color: #999;
    font-style: italic;
    padding: 8px 0;
}

.no-request {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>
