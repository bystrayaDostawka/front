<template>
    <footer class="app-footer">
        <span>© {{ new Date().getFullYear() }} Курьерская служба</span>
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
    padding: 16px 0;
    color: #999;
    position: fixed;
    left: 200px;
    bottom: 0;
    width: calc(100% - 200px);
}
</style>
