<template>
    <footer class="app-footer">
        <span>© {{ new Date().getFullYear() }} Быстрая доставка</span>
    </footer>
</template>

<script>
export default { name: "AppFooter" }
</script>

<style scoped>
.app-footer {
    background: #f4f8fb;
    border-top: 1px solid #e0e6ed;
    text-align: center;
    padding: 12px 0;
    color: #999;
    position: fixed;
    left: 200px;
    bottom: 0;
    width: calc(100% - 200px);
    font-size: 14px;
}

@media (max-width: 1023px) {
    .app-footer {
        left: 0;
        width: 100%;
        padding: 8px 0;
        font-size: 12px;
    }
}
</style>
